import { executePlaceListUseCase } from "@core/events/usecases/place_list/usecase.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import type { PlaceListResponse } from "./schemas.ts"

export interface PlaceListHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createPlaceListHandler(deps: PlaceListHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // GETエンドポイント
  app.get("/place_list", async (c) => {
    const supabaseClient = c.get("supabaseClient")

    // リポジトリファクトリーを使用してリポジトリを生成
    const factory = new EventRepositoryFactory(supabaseClient)
    const repositories = {
      placeManagementRepository: factory.createPlaceManagementRepository(),
    }

    try {
      // ユースケース実行
      const result = await executePlaceListUseCase({}, repositories)

      const response: PlaceListResponse = {
        places: result.places.map((place) => place.toResponse()),
      }

      return c.json(response)
    } catch (error) {
      if (error instanceof PlaceManagementError) {
        return c.json(
          {
            error: {
              code: error.code,
              message: error.message,
            },
          },
          error.status as 400 | 404 | 500,
        )
      }
      throw error
    }
  })

  return app
}
