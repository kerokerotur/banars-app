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
 * 出欠者情報（サマリー用）
 */
export interface AttendanceSummaryUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: AttendanceStatus;
  comment: string | null;
}

/**
 * 出欠サマリー
 */
export interface AttendanceSummary {
  attending: AttendanceSummaryUser[];
  notAttending: AttendanceSummaryUser[];
  pending: AttendanceSummaryUser[];
  unanswered: AttendanceSummaryUser[];
}
