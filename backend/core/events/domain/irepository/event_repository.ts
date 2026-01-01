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
 * イベント更新時の入力データ
 */
export interface UpdateEventInput {
  id: string
  title: string
  eventTypeId: string
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  eventPlaceId: string | null
  notesMarkdown: string | null
  updatedUser: string
}

/**
 * イベントリポジトリインターフェース
 */
export interface IEventRepository {
  /**
   * イベントを作成する
   */
  create(input: CreateEventInput): Promise<Event>

  /**
   * イベントをIDで取得する（存在しない場合は null）
   */
  findById(eventId: string): Promise<Event | null>

  /**
   * イベントを更新する
   * @returns 更新後イベント / 対象なしの場合は null
   */
  update(input: UpdateEventInput): Promise<Event | null>

  /**
   * イベントを削除する
   */
  delete(eventId: string): Promise<void>
}
