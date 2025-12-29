import type { AttendanceSummaryItem } from "@core/events/domain/irepository/event_attendance_repository.ts"

export interface EventAttendancesSummaryRequest {
  eventIds: string[]
}

export type EventAttendancesSummaryResponse = Map<
  string,
  AttendanceSummaryItem[]
>
