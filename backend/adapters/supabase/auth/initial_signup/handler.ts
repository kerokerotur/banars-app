import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import { executeInitialSignupUseCase } from "../../../../core/auth/usecases/initial_signup/index.ts"
import { supabaseMiddleware } from "../../../_shared/middleware/supabase.ts"
import { errorHandler } from "../../../_shared/middleware/error.ts"
import type { HonoVariables } from "../../../_shared/types/hono.ts"
import { initialSignupRequestSchema } from "./schemas.ts"
import { SupabaseInviteTokenRepository } from "../repositories/invite_token_repository.ts"
import { SupabaseUserRepository } from "../repositories/user_repository.ts"
import { SupabaseUserDetailRepository } from "../repositories/user_detail_repository.ts"
import { SupabaseAuthService } from "../services/auth_service.ts"

export interface InitialSignupHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createInitialSignupHandler(deps: InitialSignupHandlerDeps) {
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

  // POSTエンドポイント
  app.post("/", zValidator("json", initialSignupRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")

    // リポジトリとサービスのインスタンス化
    const inviteTokenRepository = new SupabaseInviteTokenRepository(
      supabaseClient,
    )
    const userRepository = new SupabaseUserRepository(supabaseClient)
    const userDetailRepository = new SupabaseUserDetailRepository(
      supabaseClient,
    )
    const authService = new SupabaseAuthService(supabaseClient)

    // ユースケース実行（リポジトリとサービスをDI）
    const result = await executeInitialSignupUseCase(
      {
        inviteToken: body.inviteToken,
        lineTokens: body.lineTokens,
        lineProfile: {
          lineUserId: body.lineProfile.lineUserId,
          displayName: body.lineProfile.displayName,
          avatarUrl: body.lineProfile.avatarUrl ?? null,
        },
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
