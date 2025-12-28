/**
 * ユーザーごとの出欠ステータス
 */
export type UserAttendanceStatus =
  | "participating"
  | "absent"
  | "pending"
  | "unanswered"

/**
 * イベント一覧1件のレスポンス
 */
export interface EventListItem {
  id: string
  title: string
  eventTypeId: string
  eventTypeName: string | null
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  eventPlaceId: string | null
  eventPlaceName: string | null
  eventPlaceGoogleMapsUrlNormalized: string | null
  notesMarkdown: string | null
  createdAt: Date
  updatedAt: Date
  userAttendanceStatus: UserAttendanceStatus
}

export interface EventListUseCaseRequest {
  userId: string
  limit?: number
}

export type EventListUseCaseResponse = EventListItem[]
