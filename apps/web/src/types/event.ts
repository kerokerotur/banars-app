/**
 * イベント関連の型定義
 */

/**
 * イベント一覧のアイテム
 */
export interface EventListItem {
  id: string;
  title: string;
  eventTypeId: string;
  eventTypeName: string;
  startDatetime: string;
  meetingDatetime: string | null;
  responseDeadlineDatetime: string;
  eventPlaceId: string | null;
  eventPlaceName: string | null;
  eventPlaceAddress: string | null;
  eventPlaceGoogleMapsUrl: string | null;
  notesMarkdown: string | null;
  userAttendanceStatus: "attending" | "not_attending" | "pending" | null;
  attendingCount: number;
  notAttendingCount: number;
  pendingCount: number;
  unansweredCount: number;
}

/**
 * イベント詳細
 */
export interface EventDetail {
  id: string;
  title: string;
  eventTypeId: string;
  eventTypeName: string;
  startDatetime: string;
  meetingDatetime: string | null;
  responseDeadlineDatetime: string;
  eventPlaceId: string | null;
  eventPlaceName: string | null;
  eventPlaceAddress: string | null;
  eventPlaceGoogleMapsUrl: string | null;
  notesMarkdown: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * イベント種別
 */
export interface EventType {
  id: string;
  name: string;
  displayOrder: number;
}

/**
 * イベント作成の入力データ
 */
export interface CreateEventInput {
  title: string;
  eventTypeId: string;
  startDatetime: string;
  meetingDatetime?: string;
  responseDeadlineDatetime: string;
  eventPlaceId?: string;
  notesMarkdown?: string;
}

/**
 * イベント編集の入力データ
 */
export interface UpdateEventInput {
  eventId: string;
  title: string;
  eventTypeId: string;
  startDatetime: string;
  meetingDatetime?: string;
  responseDeadlineDatetime: string;
  eventPlaceId?: string;
  notesMarkdown?: string;
}
