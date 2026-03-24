import { zValidator } from "@hono/zod-validator"

import { executeRegistrationApplyUseCase } from "@core/auth/usecases/registration_apply/index.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { registrationApplyRequestSchema } from "./schemas.ts"
import { AuthRepositoryFactory } from "../_shared/repository_factory.ts"

export interface RegistrationApplyHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createRegistrationApplyHandler(
  deps: RegistrationApplyHandlerDeps,
) {
  const app = createBaseHonoApp(deps)

  app.post(
    "/registration_apply",
    zValidator("json", registrationApplyRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")

      const factory = new AuthRepositoryFactory(supabaseClient)
      const { registrationApplicationRepository, userRepository } =
        factory.createAll()

      const result = await executeRegistrationApplyUseCase(
        { idToken: body.idToken },
        {
          lineChannelId: deps.lineChannelId,
          lineJwksUrl: deps.lineJwksUrl,
          registrationApplicationRepository,
          userRepository,
        },
      )

      return c.json({ applicationId: result.applicationId }, 201)
    },
  )

  return app
}
