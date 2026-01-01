import type { Event } from "@core/events/domain/entity/event.ts"
import type { IEventRepository } from "@core/events/domain/irepository/event_repository.ts"
import type { IEventTypeRepository } from "@core/events/domain/irepository/event_type_repository.ts"
import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

/**
 * イベント更新ユースケースのリクエスト
 */
export interface EventUpdateUseCaseRequest {
  userId: string
  eventId: string
  title: string
  eventTypeId: string
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  eventPlaceId: string | null
  notesMarkdown: string | null
}

/**
 * イベント更新ユースケースのレスポンス
 */
export interface EventUpdateUseCaseResponse {
  event: Event
}

/**
 * イベント更新ユースケースの依存関係
 */
export interface EventUpdateDependencies {
  eventRepository: IEventRepository
  eventTypeRepository: IEventTypeRepository
  placeManagementRepository: IPlaceManagementRepository
}
