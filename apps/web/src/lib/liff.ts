import liff from "@line/liff";
import { env } from "@/config/env";

/**
 * LIFF SDKを初期化します
 * @returns ログイン状態（true: ログイン済み, false: 未ログイン）
 */
export const initializeLiff = async (): Promise<boolean> => {
  try {
    await liff.init({ liffId: env.lineLiffId });
    return liff.isLoggedIn();
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    throw new Error("LINEログインの初期化に失敗しました");
  }
};

/**
 * LINEログインを実行します
 */
export const loginWithLiff = async (): Promise<void> => {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

/**
 * LINE ID Tokenを取得します
 * @returns IDトークン（未ログインの場合はnull）
 */
export const getLiffIdToken = async (): Promise<string | null> => {
  if (!liff.isLoggedIn()) {
    return null;
  }
  return liff.getIDToken();
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
