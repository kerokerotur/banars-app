import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { executeEventAttendancesSummaryUseCase } from "@core/events/usecases/event_attendances_summary/usecase.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import type { Context } from "hono"
import type { AuthenticatedHonoVariables } from "@adapters/_shared/types/hono.ts"

export interface EventAttendancesSummaryHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventAttendancesSummaryHandler(
  deps: EventAttendancesSummaryHandlerDeps,
) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.get(
    "/event_attendances_summary",
    async (c: Context<{ Variables: AuthenticatedHonoVariables }>) => {
      const supabaseClient = c.get("supabaseClient")

      const eventIdsParam = c.req.query("event_ids")

      if (!eventIdsParam) {
        return c.json(
          {
            code: "validation_error",
            message: "event_ids は必須です",
          },
          400,
        )
      }

      const eventIds = eventIdsParam.split(",").filter((id) => id.length > 0)

      const factory = new EventRepositoryFactory(supabaseClient)

      const result = await executeEventAttendancesSummaryUseCase(
        { eventIds },
        {
          eventAttendanceRepository: factory.createEventAttendanceRepository(),
        },
      )

      // Map を通常のオブジェクトに変換
      const attendances: Record<string, unknown[]> = {}
      for (const [eventId, items] of result.entries()) {
        attendances[eventId] = items
      }

      return c.json({ attendances })
    },
  )

  return app
}
