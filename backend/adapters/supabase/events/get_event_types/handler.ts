import { executeGetEventTypesUseCase } from "@core/events/usecases/get_event_types/usecase.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"

export interface GetEventTypesHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createGetEventTypesHandler(deps: GetEventTypesHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // GETエンドポイント
  app.get("/get_event_types", async (c) => {
    const supabaseClient = c.get("supabaseClient")

    try {
      const eventTypes = await executeGetEventTypesUseCase(supabaseClient)
      return c.json(eventTypes)
    } catch (error) {
      return c.json(
        {
          error: {
            code: "internal_error",
            message:
              error instanceof Error
                ? error.message
                : "イベント種別の取得に失敗しました",
          },
        },
        500,
      )
    }
  })

  return app
}
