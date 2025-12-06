import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { SupabaseClient } from "@supabase/supabase-js"

import { executeInviteIssueUseCase } from "../../../../core/auth/usecases/invite_issue/index.ts"
import { InviteIssueError } from "../../../../core/auth/domain/errors/invite_issue_error.ts"
import { supabaseMiddleware } from "../../../_shared/middleware/supabase.ts"
import { authMiddleware } from "../../../_shared/middleware/auth.ts"
import { errorHandler } from "../../../_shared/middleware/error.ts"
import type { HonoVariables } from "../../../_shared/types/hono.ts"
import { inviteIssueRequestSchema } from "./schemas.ts"

export interface InviteIssueHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createInviteIssueHandler(deps: InviteIssueHandlerDeps) {
  const app = new Hono<{ Variables: HonoVariables }>()

  // エラーハンドリング
  app.onError(errorHandler)

  // Supabaseクライアント注入
  app.use(
    "*",
    supabaseMiddleware({
      supabaseUrl: deps.supabaseUrl,
      serviceRoleKey: deps.serviceRoleKey,
    }),
  )

  // JWT検証 + manager権限チェック
  app.use("*", authMiddleware({ requiredRole: "manager" }))

  // POSTエンドポイント
  app.post("/", zValidator("json", inviteIssueRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")
    const userId = c.get("userId")!

    // ユースケース実行
    const result = await executeInviteIssueUseCase({
      expiresInDays: body.expiresInDays ?? 7,
    })

    // DBにトークンを保存
    await insertInviteToken(supabaseClient, {
      tokenHash: result.tokenHash,
      expiresDatetime: result.expiresAt.toISOString(),
      issuedBy: userId,
      createdUser: userId,
    })

    return c.json({
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    })
  })

  return app
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
