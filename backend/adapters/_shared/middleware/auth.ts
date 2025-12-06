import type { MiddlewareHandler } from "hono"
import type { HonoVariables } from "../types/hono.ts"

export interface AuthMiddlewareOptions {
  requiredRole?: string
}

/**
 * JWT検証ミドルウェア
 * Authorization headerからJWTを取得し、Supabase Auth APIで検証
 * オプションでrole検証も実施
 */
export function authMiddleware(
  options: AuthMiddlewareOptions = {},
): MiddlewareHandler<{ Variables: HonoVariables }> {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json(
        {
          code: "unauthorized",
          message: "Authorization ヘッダーが必要です。",
        },
        401,
      )
    }

    const token = authHeader.slice(7)
    const supabaseClient = c.get("supabaseClient")

    try {
      const { data, error } = await supabaseClient.auth.getUser(token)
      if (error || !data.user) {
        return c.json(
          {
            code: "unauthorized",
            message: "無効なトークンです。",
          },
          401,
        )
      }

      c.set("userId", data.user.id)
      c.set("userRole", data.user.app_metadata?.role ?? null)

      // ロール検証
      if (options.requiredRole) {
        const userRole = c.get("userRole")
        if (userRole !== options.requiredRole) {
          return c.json(
            {
              code: "forbidden",
              message: `この操作には ${options.requiredRole} 権限が必要です。`,
            },
            403,
          )
        }
      }

      await next()
    } catch (_error) {
      return c.json(
        {
          code: "unauthorized",
          message: "トークンの検証に失敗しました。",
        },
        401,
      )
    }
  }
}
