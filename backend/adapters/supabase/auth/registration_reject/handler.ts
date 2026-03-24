import { zValidator } from "@hono/zod-validator"

import { executeRegistrationRejectUseCase } from "@core/auth/usecases/registration_reject/index.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { LineMessagingService } from "../services/line_messaging_service.ts"
import { registrationRejectRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface RegistrationRejectHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelAccessToken: string
}

export function createRegistrationRejectHandler(
  deps: RegistrationRejectHandlerDeps,
) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware({ requiredRole: "manager" })],
  })

  app.post(
    "/registration_reject",
    zValidator("json", registrationRejectRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")
      const rejecterId = c.get("userId")!

      const factory = new AuthRepositoryFactory(supabaseClient)
      const { registrationApplicationRepository } = factory.createAll()
      const lineMessagingService = new LineMessagingService(
        deps.lineChannelAccessToken,
      )

      const result = await executeRegistrationRejectUseCase(
        { applicationId: body.applicationId, rejecterId },
        {
          registrationApplicationRepository,
          lineMessagingService,
        },
      )

      return c.json({ applicationId: result.applicationId })
    },
  )

  return app
}
