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

/** 監査ログのペイロード（Supabase Logs で [audit] 検索可能） */
interface AuditLogPayload {
  status: number
  code: string
  message: string
  details: Record<string, unknown> | null
  request: { method: string; path: string }
}

function writeAuditLog(payload: AuditLogPayload): void {
  console.log("[audit]", JSON.stringify(payload))
}

/**
 * エラーハンドリングミドルウェア
 * core層から投げられるエラーをキャッチしてJSON形式で返す
 * 返却前に監査ログ（ステータス・原因・リクエスト情報）を console.log で出力する
 */
export function errorHandler(
  err: Error,
  c: Context<{ Variables: HonoVariables }>,
) {
  const request = { method: c.req.method, path: c.req.path }

  // ドメインエラーの場合
  if (isDomainError(err)) {
    writeAuditLog({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details ?? null,
      request,
    })
    return c.json(
      {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
      err.status as any,
    )
  }

  // Zod バリデーションエラー（onError に来た場合）
  if (err.name === "ZodError" && "errors" in err) {
    const details =
      typeof (err as { errors: unknown }).errors !== "undefined"
        ? { validationErrors: (err as { errors: unknown }).errors }
        : null
    writeAuditLog({
      status: 400,
      code: "validation_error",
      message: err.message,
      details,
      request,
    })
    return c.json(
      {
        code: "validation_error",
        message: err.message,
        details,
      },
      400 as any,
    )
  }

  // 予期しないエラーの場合（スタック確認用に console.error も残す）
  console.error("[error-handler]", err)
  writeAuditLog({
    status: 500,
    code: "internal_error",
    message: err.message,
    details: err.stack ? { stack: err.stack } : null,
    request,
  })
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
