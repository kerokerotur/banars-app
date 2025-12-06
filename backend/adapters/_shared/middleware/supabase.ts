import { createClient } from "@supabase/supabase-js"
import type { MiddlewareHandler } from "hono"
import type { HonoVariables } from "../types/hono.ts"

export interface SupabaseConfig {
  supabaseUrl: string
  serviceRoleKey: string
}

/**
 * Supabase Admin Clientを注入するミドルウェア
 * c.get('supabaseClient')でアクセス可能
 */
export function supabaseMiddleware(
  config: SupabaseConfig,
): MiddlewareHandler<{ Variables: HonoVariables }> {
  return async (c, next) => {
    const client = createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    c.set("supabaseClient", client)
    await next()
  }
}
