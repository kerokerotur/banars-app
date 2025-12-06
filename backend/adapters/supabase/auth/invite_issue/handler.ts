import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import {
  InviteIssueError,
  executeInviteIssueUseCase,
  parseInviteIssueRequest,
} from "../../../../core/auth/usecases/invite_issue/index.ts"

const JSON_HEADERS = { "Content-Type": "application/json" }

export interface InviteIssueHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createInviteIssueHandler(
  deps: InviteIssueHandlerDeps,
): (req: Request) => Promise<Response> {
  const adminClient = createClient(deps.supabaseUrl, deps.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return async function handler(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          code: "method_not_allowed",
          message: "POST のみサポートしています。",
        }),
        { status: 405, headers: JSON_HEADERS },
      )
    }

    // JWT検証
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError(
        new InviteIssueError(
          "unauthorized",
          "Authorization ヘッダーが必要です。",
          401,
        ),
      )
    }

    const token = authHeader.slice(7)
    let userId: string
    let userRole: string | null

    try {
      const { data, error } = await adminClient.auth.getUser(token)
      if (error || !data.user) {
        return jsonError(
          new InviteIssueError(
            "unauthorized",
            "無効なトークンです。",
            401,
          ),
        )
      }
      userId = data.user.id
      userRole = data.user.app_metadata?.role ?? null
    } catch (_) {
      return jsonError(
        new InviteIssueError(
          "unauthorized",
          "トークンの検証に失敗しました。",
          401,
        ),
      )
    }

    // ロール検証
    if (userRole !== "manager") {
      return jsonError(
        new InviteIssueError(
          "forbidden",
          "この操作には manager 権限が必要です。",
          403,
        ),
      )
    }

    // リクエストボディの解析
    let body: unknown = {}
    try {
      const text = await req.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (_) {
      return jsonError(
        new InviteIssueError(
          "invalid_request",
          "JSON ボディを解析できませんでした。",
          400,
        ),
      )
    }

    let validatedRequest
    try {
      validatedRequest = parseInviteIssueRequest(body)
    } catch (error) {
      return handleError(error)
    }

    let result
    try {
      result = await executeInviteIssueUseCase(validatedRequest)
    } catch (error) {
      return handleError(error)
    }

    // DBにトークンを保存
    try {
      await insertInviteToken(adminClient, {
        tokenHash: result.tokenHash,
        expiresDatetime: result.expiresAt.toISOString(),
        issuedBy: userId,
        createdUser: userId,
      })
    } catch (error) {
      return handleError(error)
    }

    return jsonResponse({
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    })
  }
}

async function insertInviteToken(
  client: SupabaseClient,
  params: {
    tokenHash: string
    expiresDatetime: string
    issuedBy: string
    createdUser: string
  },
): Promise<void> {
  const { error } = await client.from("invite_token").insert({
    token_hash: params.tokenHash,
    expires_datetime: params.expiresDatetime,
    issued_by: params.issuedBy,
    created_user: params.createdUser,
  })

  if (error) {
    throw new InviteIssueError(
      "internal_error",
      "招待トークンの保存に失敗しました。",
      500,
      { reason: error.message },
    )
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  })
}

function jsonError(error: InviteIssueError) {
  return new Response(
    JSON.stringify({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    }),
    { status: error.status, headers: JSON_HEADERS },
  )
}

function handleError(error: unknown) {
  if (error instanceof InviteIssueError) {
    return jsonError(error)
  }
  console.error("[invite_issue] unexpected error", error)
  return jsonError(
    new InviteIssueError(
      "internal_error",
      "内部エラーが発生しました。",
      500,
    ),
  )
}

