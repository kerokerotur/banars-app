import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import { executeInviteIssueUseCase } from "@core/auth/usecases/invite_issue/index.ts"
import { ExpiresInDays } from "@core/auth/domain/entity/expires_in_days.ts"
import { supabaseMiddleware } from "@adapters/_shared/middleware/supabase.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { errorHandler } from "@adapters/_shared/middleware/error.ts"
import type { HonoVariables } from "@adapters/_shared/types/hono.ts"
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

    // ドメインエンティティを生成（バリデーションはコンストラクタで実施）
    const expiresInDays = new ExpiresInDays(body.expiresInDays)

    // リポジトリのインスタンス化
    const inviteTokenRepository = new SupabaseInviteTokenRepository(
      supabaseClient,
    )

    // ユースケース実行（リポジトリをDI）
    const result = await executeInviteIssueUseCase(
      { expiresInDays, issuedBy: userId },
      { inviteTokenRepository },
    )

    return c.json({
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    })
  })

  return app
}
