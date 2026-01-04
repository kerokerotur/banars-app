import { zValidator } from "@hono/zod-validator"

import { executeAttendanceRemindUseCase } from "@core/attendance/usecases/attendance_remind/usecase.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { attendanceRemindRequestSchema } from "./schemas.ts"
import { AttendanceRepositoryFactory } from "../_shared/repository_factory.ts"
import { AuthRepositoryFactory } from "@adapters/supabase/auth/_shared/repository_factory.ts"
import { SupabaseOneSignalNotificationService } from "../services/onesignal_notification_service.ts"

export interface AttendanceRemindHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  onesignalRestApiKey: string
  onesignalAppId: string
}

export function createAttendanceRemindHandler(
  deps: AttendanceRemindHandlerDeps,
) {
  // 認証なしで実行可能（定期実行用）
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [],
  })

  app.post(
    "/attendance_remind",
    zValidator("json", attendanceRemindRequestSchema),
    async (c) => {
      const body = c.req.valid("json")
      const supabaseClient = c.get("supabaseClient")

      // リポジトリファクトリーを使用してリポジトリを生成
      const attendanceFactory = new AttendanceRepositoryFactory(supabaseClient)
      const authFactory = new AuthRepositoryFactory(supabaseClient)

      const attendanceRepository = attendanceFactory.createAttendanceRepository()
      const onesignalPlayerRepository =
        authFactory.createOneSignalPlayerRepository()

      // OneSignal通知サービスを生成
      const onesignalNotificationService =
        new SupabaseOneSignalNotificationService({
          restApiKey: deps.onesignalRestApiKey,
          appId: deps.onesignalAppId,
        })

      try {
        const result = await executeAttendanceRemindUseCase(
          {
            remindHoursBefore: body.remindHoursBefore,
          },
          {
            attendanceRepository,
            onesignalPlayerRepository,
            onesignalNotificationService,
          },
        )

        return c.json(result)
      } catch (error) {
        console.error("attendance_remind エラー:", error)
        return c.json(
          {
            processedEvents: 0,
            sentNotifications: 0,
            errors: [
              {
                eventId: "",
                userId: "",
                error:
                  error instanceof Error ? error.message : String(error),
              },
            ],
          },
          500,
        )
      }
    },
  )

  return app
}

