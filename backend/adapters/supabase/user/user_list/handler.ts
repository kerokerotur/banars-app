import { executeUserListUseCase } from "@core/user/usecases/user_list/usecase.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { AuthRepositoryFactory } from "@adapters/supabase/auth/_shared/repository_factory.ts"

export interface UserListHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createUserListHandler(deps: UserListHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // GETエンドポイント
  app.get("/user_list", async (c) => {
    const supabaseClient = c.get("supabaseClient")

    // リポジトリファクトリーを使用してリポジトリを生成
    const factory = new AuthRepositoryFactory(supabaseClient)

    try {
      // ユースケース実行（リポジトリ内でrole情報も一括取得される）
      const userListItems = await executeUserListUseCase(
        {},
        {
          userRepository: factory.createUserRepository(),
        },
      )

      return c.json({
        users: userListItems.map((item) => item.toResponse()),
      })
    } catch (error) {
      // エラーの詳細をログに出力
      console.error("[user_list handler] Error occurred:", {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      })
      return c.json(
        {
          code: "internal_error",
          message: "ユーザー一覧の取得に失敗しました。",
        },
        500,
      )
    }
  })

  return app
}
