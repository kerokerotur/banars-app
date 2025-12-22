import { CreatedEvent } from "@core/events/domain/entity/created_event.ts"
import type {
  EventCreateDependencies,
  EventCreateUseCaseRequest,
  EventCreateUseCaseResponse,
} from "./types.ts"

export async function executeEventCreateUseCase(
  request: EventCreateUseCaseRequest,
  deps: EventCreateDependencies,
): Promise<EventCreateUseCaseResponse> {
  // NOTE: イベント種別の存在確認は、フロントエンドでキャッシュされた
  // event typesを使って検証済みのため、サーバー側では毎回DBクエリを行わない

  // 1. 会場情報のUPSERT
  const eventPlace = await deps.eventPlaceRepository.upsert({
    name: request.place.name,
    googleMapsUrl: request.place.googleMapsUrl,
    createdUser: request.userId,
  })

  // 2. イベントの作成
  const event = await deps.eventRepository.create({
    title: request.title,
    eventTypeId: request.eventTypeId,
    startDatetime: request.startDatetime,
    meetingDatetime: request.meetingDatetime,
    responseDeadlineDatetime: request.responseDeadlineDatetime,
    eventPlaceId: eventPlace.id,
    notesMarkdown: request.notesMarkdown,
    createdUser: request.userId,
  })

  // 3. 作成結果を返却
  return new CreatedEvent(event, eventPlace)
}
