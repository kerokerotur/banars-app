/**
 * 環境変数アクセス用ユーティリティ
 * Viteの環境変数（VITE_プレフィックス）を型安全に取得します
 */

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvVar("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("VITE_SUPABASE_ANON_KEY"),
  lineLiffId: getEnvVar("VITE_LINE_LIFF_ID"),
} as const;
