import { zValidator } from "@hono/zod-validator"
import { executePlaceUpdateUseCase } from "@core/events/usecases/place_update/usecase.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { placeUpdateRequestSchema } from "./schemas.ts"

export interface PlaceUpdateHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createPlaceUpdateHandler(deps: PlaceUpdateHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // PATCHエンドポイント
  app.patch(
    "/place_update",
    zValidator("json", placeUpdateRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")
      const userId = c.get("userId")!

      // リポジトリファクトリーを使用してリポジトリを生成
      const factory = new EventRepositoryFactory(supabaseClient)
      const repositories = {
        placeManagementRepository: factory.createPlaceManagementRepository(),
      }

      try {
        // ユースケース実行
        await executePlaceUpdateUseCase(
          {
            userId,
            placeId: body.place_id,
            name: body.name,
            googleMapsUrl: body.google_maps_url,
          },
          repositories,
        )

        return c.json({
          success: true,
        })
      } catch (error) {
        if (error instanceof PlaceManagementError) {
          return c.json(
            {
              success: false,
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
    },
  )

  return app
}
