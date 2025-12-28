export interface RecentEventRow {
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
}

/**
 * イベント一覧取得用のリポジトリ
 * events_recent_view などの読み取りを担当
 */
export interface IEventListRepository {
  fetchRecent(limit: number): Promise<RecentEventRow[]>
}
