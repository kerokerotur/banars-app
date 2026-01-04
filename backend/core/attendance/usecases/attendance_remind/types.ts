import type { RemindTargetEvent } from "@core/attendance/domain/irepository/attendance_repository.ts"

export interface AttendanceRemindRequest {
  remindHoursBefore?: number
}

export interface RemindTargetUser {
  userId: string
  playerIds: string[]
}

export interface AttendanceRemindResponse {
  processedEvents: number
  sentNotifications: number
  errors: Array<{
    eventId: string
    userId: string
    error: string
  }>
}

