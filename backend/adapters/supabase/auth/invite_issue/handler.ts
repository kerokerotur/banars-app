import { zValidator } from "@hono/zod-validator"

import { executeInviteIssueUseCase } from "@core/auth/usecases/invite_issue/index.ts"
import { ExpiresInDays } from "@core/auth/domain/entity/expires_in_days.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { inviteIssueRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface InviteIssueHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createInviteIssueHandler(deps: InviteIssueHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware({ requiredRole: "manager" })],
  })

  // POSTエンドポイント
  app.post("/", zValidator("json", inviteIssueRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")
    const userId = c.get("userId")!

    // ドメインエンティティを生成（バリデーションはコンストラクタで実施）
    const expiresInDays = new ExpiresInDays(body.expiresInDays)

    // リポジトリファクトリーを使用してリポジトリを生成
    const factory = new AuthRepositoryFactory(supabaseClient)
    const inviteTokenRepository = factory.createInviteTokenRepository()

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
