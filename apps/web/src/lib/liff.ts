import liff from "@line/liff";
import { env } from "@/config/env";

/**
 * liff.init() は同時・短時間の複数回呼び出しで PKCE の code_verifier が不整合になり
 * LINE の token エンドポイントが code_verifier does not match を返すことがある。
 * モジュール単位で init を一度にまとめ、常に最新の isLoggedIn を返す。
 *
 * また、liff.init() はルーティング前（main.tsx）で早期実行する必要がある。
 * 外部ブラウザでは LINE 認証コールバックの URL パラメータ (code, state) を
 * liff.init() が処理する前に React Router が strip してしまうため。
 * LINE 内ブラウザでは LIFF エンドポイント URL で init を呼ぶことで
 * LINE クライアントとの認証連携を確立する。
 */
let liffInitInFlight: Promise<void> | null = null;

function ensureLiffInitializedOnce(): Promise<void> {
  if (!liffInitInFlight) {
    liffInitInFlight = liff
      .init({ liffId: env.lineLiffId })
      .then(() => undefined)
      .catch((error) => {
        liffInitInFlight = null;
        throw error;
      });
  }
  return liffInitInFlight;
}

/**
 * ルーティング前に呼び出すことで、認証コールバックの URL パラメータを
 * liff.init() が処理できるようにする。結果は無視して良い（fire-and-forget）。
 */
export function startLiffInit(): void {
  ensureLiffInitializedOnce().catch(() => {
    /* LoginPage 側で再試行・エラー表示する */
  });
}

/**
 * LIFF SDKを初期化します
 * @returns ログイン状態（true: ログイン済み, false: 未ログイン）
 */
export const initializeLiff = async (): Promise<boolean> => {
  try {
    console.log("[LIFF] initializeLiff: init 開始", { liffId: env.lineLiffId });
    await ensureLiffInitializedOnce();
    const isLoggedIn = liff.isLoggedIn();
    console.log("[LIFF] initializeLiff: init 完了", {
      isLoggedIn,
      isInClient: liff.isInClient(),
    });
    return isLoggedIn;
  } catch (error) {
    console.error("[LIFF] initializeLiff: 失敗", error);
    throw new Error("LINEログインの初期化に失敗しました");
  }
};

/**
 * LINEログインを実行します。
 * redirectUri を明示的に /login に指定し、認証後のリダイレクト先が
 * AuthGuard を経由せず直接 LoginPage に到達するようにする。
 */
export const loginWithLiff = async (): Promise<void> => {
  console.log("[LIFF] loginWithLiff: isLoggedIn =", liff.isLoggedIn());
  if (!liff.isLoggedIn()) {
    const redirectUri = `${window.location.origin}/login`;
    console.log("[LIFF] loginWithLiff: LINE ログインページへリダイレクト", {
      redirectUri,
    });
    liff.login({ redirectUri });
  }
};

/**
 * LINE ID Tokenを取得します。
 *
 * JWT の有効期限チェックはクライアント側では行わない。
 * LIFF SDK は isLoggedIn (access token) と getIDToken (id token) の
 * 有効期限が異なり、access token が有効でも id token が切れているケースがある。
 * クライアントで弾くと再 init もされず無限に同じ期限切れトークンが返される。
 * トークンの有効性検証は Edge Function (JWKS) に委ねる。
 *
 * liff.logout() も呼ばない。セッション破棄は呼び出し元（LoginPage）の責務。
 */
export const getLiffIdToken = async (): Promise<string | null> => {
  const isLoggedIn = liff.isLoggedIn();
  console.log("[LIFF] getLiffIdToken: isLoggedIn =", isLoggedIn);
  if (!isLoggedIn) {
    return null;
  }

  const token = liff.getIDToken();
  console.log("[LIFF] getLiffIdToken: トークン取得", {
    hasToken: !!token,
    hasAccessToken: !!liff.getAccessToken(),
    isInClient: liff.isInClient(),
  });

  return token ?? null;
};

/**
 * LINEプロフィール情報を取得します
 * @returns プロフィール情報（未ログインの場合はnull）
 */
export const getLiffProfile = async () => {
  if (!liff.isLoggedIn()) {
    return null;
  }
  return await liff.getProfile();
};

/**
 * LINEログアウトを実行します
 */
export const logoutLiff = (): void => {
  if (liff.isLoggedIn()) {
    liff.logout();
  }
};
