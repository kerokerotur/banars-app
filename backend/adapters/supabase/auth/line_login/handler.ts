import { zValidator } from "@hono/zod-validator"

import { executeLineLoginUseCase } from "@core/auth/usecases/line_login/index.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { lineLoginRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface LineLoginHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createLineLoginHandler(deps: LineLoginHandlerDeps) {
  // 基本設定済みのHonoアプリを作成
  const app = createBaseHonoApp(deps)

  // POSTエンドポイント（Supabase Edge Functionsではパスに関数名が含まれる）
  app.post("/line_login", zValidator("json", lineLoginRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")

    // リポジトリファクトリーを使用してリポジトリとサービスを一括生成
    const factory = new AuthRepositoryFactory(supabaseClient)
    const { userRepository, authService } = factory.createAll()

    // ユースケース実行（リポジトリとサービスをDI）
    const result = await executeLineLoginUseCase(
      {
        idToken: body.idToken,
      },
      {
        lineChannelId: deps.lineChannelId,
        lineJwksUrl: deps.lineJwksUrl,
        userRepository,
        authService,
      },
    )

    return c.json({
      sessionTransferToken: result.sessionTransferToken,
    })
  })

  return app
}

