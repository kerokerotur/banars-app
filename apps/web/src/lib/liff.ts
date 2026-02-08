import liff from "@line/liff";
import { env } from "@/config/env";

/**
 * LIFF SDKを初期化します
 * @returns ログイン状態（true: ログイン済み, false: 未ログイン）
 */
export const initializeLiff = async (): Promise<boolean> => {
  try {
    console.log("[LIFF] initializeLiff: init 開始", { liffId: env.lineLiffId });
    await liff.init({ liffId: env.lineLiffId });
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
 * LINE ID Tokenを取得します
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
  return token;
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
