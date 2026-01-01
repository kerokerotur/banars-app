import { zValidator } from "@hono/zod-validator"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { eventDeleteRequestSchema } from "./schemas.ts"
import { executeEventDeleteUseCase } from "@core/events/usecases/event_delete/usecase.ts"
import { EventDeleteError } from "@core/events/domain/errors/event_delete_error.ts"

export interface EventDeleteHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventDeleteHandler(deps: EventDeleteHandlerDeps) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware({ requiredRole: "manager" })],
  })

  app.post(
    "/event_delete",
    zValidator("json", eventDeleteRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")

      const factory = new EventRepositoryFactory(supabaseClient)
      const repositories = {
        eventRepository: factory.createEventRepository(),
        eventAttendanceRepository: factory.createEventAttendanceRepository(),
      }

      try {
        await executeEventDeleteUseCase(
          {
            eventId: body.event_id,
          },
          repositories,
        )

        return c.json({ success: true })
      } catch (error) {
        if (error instanceof EventDeleteError) {
          return c.json(
            {
              success: false,
              error: {
                code: error.code,
                message: error.message,
                details: error.details,
              },
            },
            error.status as 400 | 401 | 403 | 404 | 500,
          )
        }
        throw error
      }
    },
  )

  return app
}
