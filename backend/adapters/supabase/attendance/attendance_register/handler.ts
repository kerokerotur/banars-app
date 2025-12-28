import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { executeAttendanceRegisterUseCase } from "@core/attendance/usecases/attendance_register/usecase.ts"
import { AttendanceRegisterError } from "@core/attendance/domain/errors/attendance_register_error.ts"
import { zValidator } from "@hono/zod-validator"
import type { AttendanceRegisterRequestBody } from "./schemas.ts"
import { attendanceRegisterRequestSchema } from "./schemas.ts"
import { AttendanceRepositoryFactory } from "../_shared/repository_factory.ts"

export interface AttendanceRegisterHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createAttendanceRegisterHandler(
  deps: AttendanceRegisterHandlerDeps,
) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.post(
    "/attendance_register",
    zValidator("json", attendanceRegisterRequestSchema),
    async (c) => {
      const body = c.req.valid("json") as AttendanceRegisterRequestBody
      const supabaseClient = c.get("supabaseClient")
      const userId = c.get("userId")!

      const factory = new AttendanceRepositoryFactory(supabaseClient)

      try {
        const result = await executeAttendanceRegisterUseCase(
          {
            userId,
            eventId: body.eventId,
            status: body.status,
            comment: body.comment ?? null,
          },
          { attendanceRepository: factory.createAttendanceRepository() },
        )

        return c.json(result)
      } catch (error) {
        if (error instanceof AttendanceRegisterError) {
          return c.json(
            {
              code: error.code,
              message: error.message,
              details: error.details ?? null,
            },
            error.status as 400 | 403 | 404 | 500,
          )
        }
        throw error
      }
    },
  )

  return app
}
