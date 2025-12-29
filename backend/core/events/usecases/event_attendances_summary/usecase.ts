import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"
import type {
  EventAttendancesSummaryRequest,
  EventAttendancesSummaryResponse,
} from "./types.ts"

export interface EventAttendancesSummaryUseCaseDependencies {
  eventAttendanceRepository: IEventAttendanceRepository
}

/**
 * 複数イベントの出欠者概要を一括取得するユースケース
 */
export async function executeEventAttendancesSummaryUseCase(
  request: EventAttendancesSummaryRequest,
  deps: EventAttendancesSummaryUseCaseDependencies,
): Promise<EventAttendancesSummaryResponse> {
  if (!request.eventIds || request.eventIds.length === 0) {
    return new Map()
  }

  return await deps.eventAttendanceRepository.findAttendancesSummaryByEventIds(
    request.eventIds,
  )
}
