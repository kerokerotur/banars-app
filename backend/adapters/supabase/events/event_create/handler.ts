import { zValidator } from "@hono/zod-validator"
import { executeEventCreateUseCase } from "@core/events/usecases/event_create/usecase.ts"
import { EventCreateError } from "@core/events/domain/errors/event_create_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { eventCreateRequestSchema } from "./schemas.ts"

export interface EventCreateHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventCreateHandler(deps: EventCreateHandlerDeps) {
  // 基本設定済みのHonoアプリを作成（認証ミドルウェアを追加）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // POSTエンドポイント
  app.post(
    "/event_create",
    zValidator("json", eventCreateRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")
      const userId = c.get("userId")!

      // リポジトリファクトリーを使用してリポジトリを生成
      const factory = new EventRepositoryFactory(supabaseClient)
      const repositories = {
        eventRepository: factory.createEventRepository(),
        eventPlaceRepository: factory.createEventPlaceRepository(),
      }

      try {
        // ユースケース実行
        const result = await executeEventCreateUseCase(
          {
            userId,
            title: body.title,
            eventTypeId: body.eventTypeId,
            startDatetime: body.startDatetime ?? null,
            meetingDatetime: body.meetingDatetime ?? null,
            responseDeadlineDatetime: body.responseDeadlineDatetime ?? null,
            place: {
              name: body.place.name,
              googleMapsUrl: body.place.googleMapsUrl,
            },
            notesMarkdown: body.notesMarkdown ?? null,
          },
          repositories,
        )

        return c.json(result.toResponse())
      } catch (error) {
        if (error instanceof EventCreateError) {
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
