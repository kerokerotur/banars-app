/**
 * CORS ヘッダー定義（Supabase Edge Functions でブラウザから呼び出す際のプリフライト用）
 * Supabase 推奨のヘッダーを定義し、共有基盤や他ハンドラーから再利用する。
 */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}
