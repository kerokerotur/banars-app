import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import { executeInviteIssueUseCase } from "../../../../core/auth/usecases/invite_issue/index.ts"
import { supabaseMiddleware } from "../../../_shared/middleware/supabase.ts"
import { authMiddleware } from "../../../_shared/middleware/auth.ts"
import { errorHandler } from "../../../_shared/middleware/error.ts"
import type { HonoVariables } from "../../../_shared/types/hono.ts"
import { inviteIssueRequestSchema } from "./schemas.ts"
import { SupabaseInviteTokenRepository } from "../repositories/invite_token_repository.ts"

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

    // リポジトリのインスタンス化
    const inviteTokenRepository = new SupabaseInviteTokenRepository(
      supabaseClient,
    )

    // ユースケース実行（リポジトリをDI）
    const result = await executeInviteIssueUseCase(
      {
        expiresInDays: body.expiresInDays ?? 7,
        issuedBy: userId,
      },
      {
        inviteTokenRepository,
      },
    )

    return c.json({
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    })
  })

  return app
}
