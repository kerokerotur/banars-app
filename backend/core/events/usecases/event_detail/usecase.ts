import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"
import { EventDetailError } from "@core/events/domain/errors/event_detail_error.ts"
import type {
  EventDetailRequest,
  EventDetailResponse,
} from "./types.ts"

export interface EventDetailUseCaseDependencies {
  eventAttendanceRepository: IEventAttendanceRepository
}

export async function executeEventDetailUseCase(
  request: EventDetailRequest,
  deps: EventDetailUseCaseDependencies,
): Promise<EventDetailResponse> {
  if (!request.eventId) {
    throw new EventDetailError("validation_error", "eventId は必須です", 400)
  }

  return deps.eventAttendanceRepository.findByEventId(request.eventId)
}
