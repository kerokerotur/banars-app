import type { CreatedEvent } from "@core/events/domain/entity/created_event.ts"
import type { IEventRepository } from "@core/events/domain/irepository/event_repository.ts"
import type { IEventPlaceRepository } from "@core/events/domain/irepository/event_place_repository.ts"

/**
 * イベント作成ユースケースのリクエスト
 */
export interface EventCreateUseCaseRequest {
  userId: string
  title: string
  eventTypeId: string
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  place: {
    name: string
    address: string
    latitude: number | null
    longitude: number | null
    osmId: number | null
    osmType: string | null
  }
  notesMarkdown: string | null
}

/**
 * イベント作成ユースケースのレスポンス
 */
export type EventCreateUseCaseResponse = CreatedEvent

/**
 * イベント作成ユースケースの依存関係
 */
export interface EventCreateDependencies {
  eventRepository: IEventRepository
  eventPlaceRepository: IEventPlaceRepository
}
