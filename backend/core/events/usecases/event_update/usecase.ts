import { EventUpdateError } from "@core/events/domain/errors/event_update_error.ts"
import type {
  EventUpdateDependencies,
  EventUpdateUseCaseRequest,
  EventUpdateUseCaseResponse,
} from "./types.ts"

/**
 * イベント更新ユースケース
 */
export async function executeEventUpdateUseCase(
  request: EventUpdateUseCaseRequest,
  deps: EventUpdateDependencies,
): Promise<EventUpdateUseCaseResponse> {
  if (!request.eventId) {
    throw new EventUpdateError("validation_error", "eventId は必須です", 400)
  }

  // イベント種別の存在確認
  const eventTypeExists = await deps.eventTypeRepository.exists(
    request.eventTypeId,
  )
  if (!eventTypeExists) {
    throw new EventUpdateError(
      "event_type_not_found",
      "イベント種別が存在しません",
      404,
    )
  }

  // 会場IDが指定されている場合のみ存在確認
  if (request.eventPlaceId) {
    const place = await deps.placeManagementRepository.findById(
      request.eventPlaceId,
    )
    if (!place) {
      throw new EventUpdateError(
        "event_place_not_found",
        "指定された会場が見つかりません",
        404,
      )
    }
  }

  // 更新
  const updated = await deps.eventRepository.update({
    id: request.eventId,
    title: request.title,
    eventTypeId: request.eventTypeId,
    startDatetime: request.startDatetime,
    meetingDatetime: request.meetingDatetime,
    responseDeadlineDatetime: request.responseDeadlineDatetime,
    eventPlaceId: request.eventPlaceId,
    notesMarkdown: request.notesMarkdown,
    updatedUser: request.userId,
  })

  if (!updated) {
    throw new EventUpdateError("not_found", "イベントが見つかりません", 404)
  }

  return { event: updated }
}
