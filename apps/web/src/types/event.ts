/**
 * イベント関連の型定義
 */

/** イベント一覧 API（event_list）が返す、ログインユーザーの出欠状態 */
export type EventListUserAttendanceStatus =
  | "participating"
  | "absent"
  | "pending"
  | "unanswered";

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
  userAttendanceStatus: EventListUserAttendanceStatus;
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
 * イベント会場
 */
export interface EventPlace {
  id: string;
  name: string;
  googleMapsUrl: string | null;
  createdAt: string;
}

/**
 * イベント作成の入力データ（バックエンド event_create API 準拠）
 */
export interface CreateEventInput {
  title: string;
  eventTypeId: string;
  startDatetime?: string | null;
  meetingDatetime?: string | null;
  responseDeadlineDatetime?: string | null;
  place: {
    name: string;
    googleMapsUrl: string;
  };
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
