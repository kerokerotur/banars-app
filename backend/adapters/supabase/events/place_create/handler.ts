import { zValidator } from "@hono/zod-validator"
import { executePlaceCreateUseCase } from "@core/events/usecases/place_create/usecase.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { placeCreateRequestSchema } from "./schemas.ts"

export interface PlaceCreateHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createPlaceCreateHandler(deps: PlaceCreateHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // POSTエンドポイント
  app.post(
    "/place_create",
    zValidator("json", placeCreateRequestSchema),
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
        const result = await executePlaceCreateUseCase(
          {
            userId,
            name: body.name,
            googleMapsUrl: body.google_maps_url,
          },
          repositories,
        )

        return c.json({
          success: true,
          place_id: result.place.id,
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
              existing_place: error.details?.existing_place,
            },
            error.status as 400 | 404 | 409 | 500,
          )
        }
        throw error
      }
    },
  )

  return app
}
