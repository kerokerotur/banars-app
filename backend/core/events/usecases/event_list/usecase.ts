import { EventListError } from "@core/events/domain/errors/event_list_error.ts"
import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"
import type { IEventListRepository } from "@core/events/domain/irepository/event_list_repository.ts"
import type {
  EventListUseCaseRequest,
  EventListUseCaseResponse,
} from "./types.ts"

const DEFAULT_LIMIT = 50

export interface EventListUseCaseDependencies {
  eventListRepository: IEventListRepository
  eventAttendanceRepository: IEventAttendanceRepository
}

/**
 * 直近イベント一覧を取得するユースケース
 */
export async function executeEventListUseCase(
  request: EventListUseCaseRequest,
  deps: EventListUseCaseDependencies,
): Promise<EventListUseCaseResponse> {
  const limit = request.limit ?? DEFAULT_LIMIT
  if (limit <= 0) {
    throw new EventListError(
      "internal_error",
      "limit は 1 以上で指定してください。",
      400,
    )
  }

  const events = await deps.eventListRepository.fetchRecent(limit)
  if (events.length === 0) {
    return []
  }

  const attendanceMap = await deps.eventAttendanceRepository.findStatusesByUser(
    request.userId,
    events.map((e) => e.id),
  )

  return events.map((row) => ({
    id: row.id,
    title: row.title,
    eventTypeId: row.eventTypeId,
    eventTypeName: row.eventTypeName,
    startDatetime: row.startDatetime,
    meetingDatetime: row.meetingDatetime,
    responseDeadlineDatetime: row.responseDeadlineDatetime,
    eventPlaceId: row.eventPlaceId,
    eventPlaceName: row.eventPlaceName,
    eventPlaceGoogleMapsUrlNormalized: row.eventPlaceGoogleMapsUrlNormalized,
    notesMarkdown: row.notesMarkdown,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userAttendanceStatus: attendanceMap.get(row.id) ?? "unanswered",
  }))
}
