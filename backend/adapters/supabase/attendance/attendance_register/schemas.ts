import { z } from "zod"
import type { AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"

export const attendanceRegisterRequestSchema = z.object({
  eventId: z.string().uuid("eventId は UUID で指定してください"),
  status: z
    .enum(["attending", "not_attending", "pending"], {
      errorMap: () => ({ message: "status は attending / not_attending / pending のいずれかです" }),
    }),
  comment: z.string().optional(),
})

export type AttendanceRegisterRequestBody = z.infer<typeof attendanceRegisterRequestSchema>

export type AttendanceRegisterResponseBody = AttendanceRegisterResponse
