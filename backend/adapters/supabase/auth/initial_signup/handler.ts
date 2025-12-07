import { zValidator } from "@hono/zod-validator"

import { executeInitialSignupUseCase } from "@core/auth/usecases/initial_signup/index.ts"
import { LineTokens } from "@core/auth/domain/value_objects/line_tokens.ts"
import { LineProfile } from "@core/auth/domain/entity/line_profile.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { initialSignupRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface InitialSignupHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createInitialSignupHandler(deps: InitialSignupHandlerDeps) {
  // 基本設定済みのHonoアプリを作成
  const app = createBaseHonoApp(deps)

  // POSTエンドポイント
  app.post("/", zValidator("json", initialSignupRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")

    // ドメインエンティティを生成（バリデーションはクラスで実施）
    const lineTokens = LineTokens.fromRaw(body.lineTokens)
    const lineProfile = LineProfile.fromRaw(body.lineProfile)

    // リポジトリファクトリーを使用してリポジトリとサービスを一括生成
    const factory = new AuthRepositoryFactory(supabaseClient)
    const {
      inviteTokenRepository,
      userRepository,
      userDetailRepository,
      authService,
    } = factory.createAll()

    // ユースケース実行（リポジトリとサービスをDI）
    const result = await executeInitialSignupUseCase(
      {
        inviteToken: body.inviteToken,
        lineTokens,
        lineProfile,
      },
      {
        lineChannelId: deps.lineChannelId,
        lineJwksUrl: deps.lineJwksUrl,
        inviteTokenRepository,
        userRepository,
        userDetailRepository,
        authService,
      },
    )

    return c.json({
      userId: result.userId,
      sessionTransferToken: result.sessionTransferToken,
    })
  })

  return app
}
