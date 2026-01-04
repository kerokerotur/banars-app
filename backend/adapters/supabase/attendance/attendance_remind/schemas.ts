import { z } from "zod"

/**
 * attendance_remind APIのリクエストボディスキーマ
 */
export const attendanceRemindRequestSchema = z.object({
  remindHoursBefore: z.number().int().positive().optional(),
})

export type AttendanceRemindRequest = z.infer<
  typeof attendanceRemindRequestSchema
>

