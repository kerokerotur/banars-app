import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { executeEventDetailUseCase } from "@core/events/usecases/event_detail/usecase.ts"
import type { Context } from "hono"
import type { AuthenticatedHonoVariables } from "@adapters/_shared/types/hono.ts"
import { EventDetailError } from "@core/events/domain/errors/event_detail_error.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import type { EventDetailApiResponse } from "./schemas.ts"

export interface EventDetailHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventDetailHandler(deps: EventDetailHandlerDeps) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.get("/events/detail", async (c: Context<{ Variables: AuthenticatedHonoVariables }>) => {
    const eventId = c.req.query("event_id")
    if (!eventId) {
      throw new EventDetailError("validation_error", "event_id は必須です", 400)
    }

    const supabaseClient = c.get("supabaseClient")
    const factory = new EventRepositoryFactory(supabaseClient)

    const attendance = await executeEventDetailUseCase(
      { eventId },
      { eventAttendanceRepository: factory.createEventAttendanceRepository() },
    )

    const response: EventDetailApiResponse = { attendance }
    return c.json(response)
  })

  return app
}
