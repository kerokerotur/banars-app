import { executeGetMeUseCase } from "@core/auth/usecases/get_me/usecase.ts"
import { GetMeError } from "@core/auth/domain/errors/get_me_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface GetMeHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createGetMeHandler(deps: GetMeHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // GETエンドポイント
  app.get("/get_me", async (c) => {
    const supabaseClient = c.get("supabaseClient")
    const userId = c.get("userId")!
    const userRole = c.get("userRole") ?? null

    // リポジトリファクトリーを使用してリポジトリを生成
    const factory = new AuthRepositoryFactory(supabaseClient)

    try {
      // ユースケース実行
      const userInfo = await executeGetMeUseCase(
        { userId, userRole },
        {
          userRepository: factory.createUserRepository(),
          userDetailRepository: factory.createUserDetailRepository(),
        },
      )

      return c.json(userInfo.toResponse())
    } catch (error) {
      if (error instanceof GetMeError) {
        return c.json(
          {
            code: error.code,
            message: error.message,
          },
          error.status as 400 | 404 | 500,
        )
      }
      throw error
    }
  })

  return app
}

