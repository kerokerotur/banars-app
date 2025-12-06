import type { Context } from "hono"
import type { HonoVariables } from "../types/hono.ts"

/**
 * ドメインエラーの基底インターフェース
 * core層のエラークラスはこの構造を持つことを想定
 */
interface DomainError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}

/**
 * エラーハンドリングミドルウェア
 * core層から投げられるエラーをキャッチしてJSON形式で返す
 */
export function errorHandler(
  err: Error,
  c: Context<{ Variables: HonoVariables }>,
) {
  console.error("[error-handler]", err)

  // ドメインエラーの場合
  if (isDomainError(err)) {
    return c.json(
      {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
      err.status as any,
    )
  }

  // 予期しないエラーの場合
  return c.json(
    {
      code: "internal_error",
      message: "内部エラーが発生しました。",
    },
    500 as any,
  )
}

function isDomainError(err: unknown): err is DomainError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err &&
    "status" in err &&
    typeof (err as DomainError).code === "string" &&
    typeof (err as DomainError).message === "string" &&
    typeof (err as DomainError).status === "number"
  )
}
