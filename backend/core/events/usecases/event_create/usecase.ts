import { CreatedEvent } from "@core/events/domain/entity/created_event.ts"
import { generatePlaceFingerprint } from "@core/events/domain/service/place_fingerprint.ts"
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
  // OSM IDがある場合とない場合で処理を分ける
  const placeFingerprint =
    request.place.osmId === null
      ? await generatePlaceFingerprint(request.place.name, request.place.address)
      : null

  const eventPlace = await deps.eventPlaceRepository.upsert({
    name: request.place.name,
    address: request.place.address,
    latitude: request.place.latitude,
    longitude: request.place.longitude,
    osmId: request.place.osmId,
    osmType: request.place.osmType,
    placeFingerprint,
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
