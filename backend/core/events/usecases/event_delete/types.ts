import type { IEventRepository } from "@core/events/domain/irepository/event_repository.ts"
import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"

export interface EventDeleteRequest {
  eventId: string
}

export interface EventDeleteResponse {
  success: true
}

export interface EventDeleteDependencies {
  eventRepository: IEventRepository
  eventAttendanceRepository: IEventAttendanceRepository
}
