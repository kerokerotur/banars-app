import { Hono } from "hono"
import type { MiddlewareHandler } from "hono"
import { supabaseMiddleware } from "../middleware/supabase.ts"
import { errorHandler } from "../middleware/error.ts"
import type { HonoVariables } from "../types/hono.ts"

export interface BaseHonoAppConfig {
  supabaseUrl: string
  serviceRoleKey: string
}

export interface CreateHonoAppOptions {
  additionalMiddleware?: MiddlewareHandler<{ Variables: HonoVariables }>[]
}

/**
 * 基本設定済みのHonoアプリケーションを作成する
 * - エラーハンドリング
 * - Supabaseクライアント注入
 * - 追加ミドルウェア（オプション）
 */
export function createBaseHonoApp(
  config: BaseHonoAppConfig,
  options: CreateHonoAppOptions = {},
) {
  const app = new Hono<{ Variables: HonoVariables }>()

  // エラーハンドリング
  app.onError(errorHandler)

  // リクエストパスのデバッグログ
  app.use("*", async (c, next) => {
    console.log(`[debug] Request: ${c.req.method} ${c.req.path}`)
    console.log(`[debug] URL: ${c.req.url}`)
    await next()
  })

  // Supabaseクライアント注入
  app.use(
    "*",
    supabaseMiddleware({
      supabaseUrl: config.supabaseUrl,
      serviceRoleKey: config.serviceRoleKey,
    }),
  )

  // 追加ミドルウェアを適用
  if (options.additionalMiddleware) {
    for (const middleware of options.additionalMiddleware) {
      app.use("*", middleware)
    }
  }

  return app
}
