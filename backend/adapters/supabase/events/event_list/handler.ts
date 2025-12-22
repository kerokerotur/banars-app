import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { executeEventListUseCase } from "@core/events/usecases/event_list/usecase.ts"
import type { EventListResponse } from "./schemas.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import type { Context } from "hono"
import type { AuthenticatedHonoVariables } from "@adapters/_shared/types/hono.ts"

export interface EventListHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createEventListHandler(deps: EventListHandlerDeps) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.get("/events/list", async (c: Context<{ Variables: AuthenticatedHonoVariables }>) => {
    const supabaseClient = c.get("supabaseClient")
    const userId = c.get("userId")

    const factory = new EventRepositoryFactory(supabaseClient)
    const deps = {
      eventListRepository: factory.createEventListRepository(),
      eventAttendanceRepository: factory.createEventAttendanceRepository(),
    }

    const limitParam = c.req.query("limit")
    const limit = limitParam ? Number(limitParam) : undefined
    if (limitParam && (Number.isNaN(limit) || limit! <= 0)) {
      return c.json(
        { code: "validation_error", message: "limit は正の整数で指定してください。" },
        400,
      )
    }

    const events = await executeEventListUseCase({ userId, limit }, deps)

    const response: EventListResponse = { events }
    return c.json(response)
  })

  return app
}
