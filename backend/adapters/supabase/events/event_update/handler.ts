import { zValidator } from "@hono/zod-validator"
import { executeEventUpdateUseCase } from "@core/events/usecases/event_update/usecase.ts"
import { EventUpdateError } from "@core/events/domain/errors/event_update_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { eventUpdateRequestSchema } from "./schemas.ts"

export interface EventUpdateHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventUpdateHandler(deps: EventUpdateHandlerDeps) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.post(
    "/event_update",
    zValidator("json", eventUpdateRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")
      const userId = c.get("userId")!

      const factory = new EventRepositoryFactory(supabaseClient)
      const repositories = {
        eventRepository: factory.createEventRepository(),
        eventTypeRepository: factory.createEventTypeRepository(),
        placeManagementRepository: factory.createPlaceManagementRepository(),
      }

      try {
        const result = await executeEventUpdateUseCase(
          {
            userId,
            eventId: body.eventId,
            title: body.title,
            eventTypeId: body.eventTypeId,
            startDatetime: body.startDatetime ?? null,
            meetingDatetime: body.meetingDatetime ?? null,
            responseDeadlineDatetime: body.responseDeadlineDatetime ?? null,
            eventPlaceId: body.eventPlaceId ?? null,
            notesMarkdown: body.notesMarkdown ?? null,
          },
          repositories,
        )

        return c.json({
          success: true,
          event: {
            id: result.event.id,
            title: result.event.title,
            eventTypeId: result.event.eventTypeId,
            startDatetime: result.event.startDatetime?.toISOString() ?? null,
            meetingDatetime: result.event.meetingDatetime?.toISOString() ?? null,
            responseDeadlineDatetime:
              result.event.responseDeadlineDatetime?.toISOString() ?? null,
            eventPlaceId: result.event.eventPlaceId,
            notesMarkdown: result.event.notesMarkdown,
            createdAt: result.event.createdAt.toISOString(),
            createdUser: result.event.createdUser,
            updatedAt: result.event.updatedAt.toISOString(),
            updatedUser: result.event.updatedUser,
          },
        })
      } catch (error) {
        if (error instanceof EventUpdateError) {
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
