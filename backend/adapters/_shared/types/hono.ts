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

/**
 * Authenticated Hono Context Variables
 * authMiddleware通過後のハンドラーで使用する型
 * userIdが必須であることを型レベルで保証
 */
export type AuthenticatedHonoVariables = HonoVariables & {
  userId: string
}
