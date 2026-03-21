import liff from "@line/liff";
import { env } from "@/config/env";

/**
 * liff.init() は同時・短時間の複数回呼び出しで PKCE の code_verifier が不整合になり
 * LINE の token エンドポイントが code_verifier does not match を返すことがある。
 * モジュール単位で init を一度にまとめ、常に最新の isLoggedIn を返す。
 */
let liffInitInFlight: Promise<void> | null = null;

async function ensureLiffInitializedOnce(): Promise<void> {
  if (!liffInitInFlight) {
    liffInitInFlight = liff
      .init({ liffId: env.lineLiffId })
      .then(() => undefined)
      .catch((error) => {
        liffInitInFlight = null;
        throw error;
      });
  }
  await liffInitInFlight;
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
    console.log("[LIFF] initializeLiff: init 完了", { isLoggedIn });
    return isLoggedIn;
  } catch (error) {
    console.error("[LIFF] initializeLiff: 失敗", error);
    throw new Error("LINEログインの初期化に失敗しました");
  }
};

/**
 * LINEログインを実行します
 */
export const loginWithLiff = async (): Promise<void> => {
  console.log("[LIFF] loginWithLiff: isLoggedIn =", liff.isLoggedIn());
  if (!liff.isLoggedIn()) {
    console.log("[LIFF] loginWithLiff: LINE ログインページへリダイレクト");
    liff.login();
  }
};

/**
 * JWTの有効期限が切れているか確認します（30秒のバッファあり）
 */
const isJwtExpired = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length < 3 || !parts[1]) return true;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
};

/**
 * LINE ID Tokenを取得します。期限切れの場合はリフレッシュします。
 * @returns IDトークン（未ログインの場合はnull）
 */
export const getLiffIdToken = async (): Promise<string | null> => {
  const isLoggedIn = liff.isLoggedIn();
  console.log("[LIFF] getLiffIdToken: isLoggedIn =", isLoggedIn);
  if (!isLoggedIn) {
    return null;
  }

  const token = liff.getIDToken();
  console.log("[LIFF] getLiffIdToken: トークン取得", token ? "あり" : "なし");

  if (!token) {
    // isLoggedIn=true なのにトークンが取得できない場合（別端末でのログイン後など LIFF セッションが不整合な状態）
    // 自動リダイレクトすると同じ状態でループするため、セッションのみクリアしてユーザー操作に委ねる
    console.log("[LIFF] getLiffIdToken: isLoggedIn=true だがトークンなし、LIFF セッションをクリア");
    liff.logout();
    return null;
  }

  if (!isJwtExpired(token)) {
    return token;
  }

  // トークン期限切れ: localStorage のキャッシュをクリアして null を返す
  // 自動で liff.login() を呼ぶとループするため、再ログインはユーザー操作に委ねる
  console.log("[LIFF] getLiffIdToken: トークン期限切れ、キャッシュクリア（再ログインはユーザー操作に委ねる）");
  liff.logout();
  return null;
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
