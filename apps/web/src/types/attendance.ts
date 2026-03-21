/**
 * 出欠関連の型定義
 */

/**
 * 出欠状態
 */
export type AttendanceStatus = "attending" | "not_attending" | "pending";

/**
 * 出欠情報
 */
export interface Attendance {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 出欠登録の入力データ
 */
export interface RegisterAttendanceInput {
  eventId: string;
  status: AttendanceStatus;
  comment?: string;
}

/**
 * イベント出欠詳細（event_detail API のレスポンス）
 */
export interface EventAttendanceDetail {
  id: string;
  memberId: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "attending" | "not_attending" | "pending";
  comment: string | null;
  updatedAt: string;
}

/**
 * バッチ出欠サマリーの個別アイテム（event_attendances_summary API のレスポンス単位）
 */
export interface AttendanceSummaryBatchItem {
  userId: string;
  status: "attending" | "not_attending" | "pending";
}

/**
 * イベントごとの出欠カウント（クライアント側で集計）
 */
export interface AttendanceCounts {
  attendingCount: number;
  notAttendingCount: number;
  pendingCount: number;
  answeredCount: number;
}
