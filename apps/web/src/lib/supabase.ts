import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Supabaseクライアントのシングルトンインスタンス
 * セッション管理とトークン自動リフレッシュが有効化されています
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
