import type { Event } from "../entity/event.ts"

/**
 * イベント作成時の入力データ
 */
export interface CreateEventInput {
  title: string
  eventTypeId: string
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  eventPlaceId: string
  notesMarkdown: string | null
  createdUser: string | null
}

/**
 * イベントリポジトリインターフェース
 */
export interface IEventRepository {
  /**
   * イベントを作成する
   */
  create(input: CreateEventInput): Promise<Event>
}
