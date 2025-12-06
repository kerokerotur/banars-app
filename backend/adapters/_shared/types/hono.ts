import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Hono Context Variables
 * c.get('supabaseClient') などで取得できる変数の型定義
 */
export type HonoVariables = {
  supabaseClient: SupabaseClient
  userId?: string
  userRole?: string
}
