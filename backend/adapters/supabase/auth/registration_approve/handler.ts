import { zValidator } from "@hono/zod-validator"

import { executeRegistrationApproveUseCase } from "@core/auth/usecases/registration_approve/index.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { LineMessagingService } from "../services/line_messaging_service.ts"
import { registrationApproveRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface RegistrationApproveHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelAccessToken: string
}

export function createRegistrationApproveHandler(
  deps: RegistrationApproveHandlerDeps,
) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware({ requiredRole: "manager" })],
  })

  app.post(
    "/registration_approve",
    zValidator("json", registrationApproveRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")
      const approverId = c.get("userId")!

      const factory = new AuthRepositoryFactory(supabaseClient)
      const { registrationApplicationRepository, userRepository, userDetailRepository } =
        factory.createAll()
      const lineMessagingService = new LineMessagingService(
        deps.lineChannelAccessToken,
      )

      const result = await executeRegistrationApproveUseCase(
        { applicationId: body.applicationId, approverId },
        {
          registrationApplicationRepository,
          userRepository,
          userDetailRepository,
          lineMessagingService,
        },
      )

      return c.json({ userId: result.userId })
    },
  )

  return app
}
