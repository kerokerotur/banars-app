import { zValidator } from "@hono/zod-validator"

import { executeRegistrationListUseCase } from "@core/auth/usecases/registration_list/index.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { registrationApplicationsQuerySchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface RegistrationApplicationsHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createRegistrationApplicationsHandler(
  deps: RegistrationApplicationsHandlerDeps,
) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware({ requiredRole: "manager" })],
  })

  app.get(
    "/registration_applications",
    zValidator("query", registrationApplicationsQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const supabaseClient = c.get("supabaseClient")

      const factory = new AuthRepositoryFactory(supabaseClient)
      const { registrationApplicationRepository } = factory.createAll()

      const result = await executeRegistrationListUseCase(
        { status: query.status },
        { registrationApplicationRepository },
      )

      return c.json({
        applications: result.applications.map((app) => ({
          id: app.id,
          lineUserId: app.lineUserId,
          displayName: app.displayName,
          avatarUrl: app.avatarUrl,
          status: app.status,
          createdAt: app.createdAt.toISOString(),
        })),
      })
    },
  )

  return app
}
