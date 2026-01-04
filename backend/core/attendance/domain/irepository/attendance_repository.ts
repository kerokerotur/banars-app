import type { AttendanceStatus, AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"

export interface AttendanceEventRecord {
  id: string
  responseDeadlineDatetime: Date | null
}

export interface UpsertAttendanceInput {
  eventId: string
  memberId: string
  status: AttendanceStatus
  comment?: string | null
}

export interface RemindTargetEvent {
  id: string
  title: string
  responseDeadlineDatetime: Date
}

export interface UnrespondedUser {
  userId: string
}

export interface IAttendanceRepository {
  findEventById(eventId: string): Promise<AttendanceEventRecord | null>
  upsertAttendance(input: UpsertAttendanceInput): Promise<AttendanceRegisterResponse>
  /**
   * リマインド対象イベントを取得する
   * @param remindHoursBefore リマインドする時間（時間単位）
   * @returns リマインド対象イベントのリスト
   */
  findRemindTargetEvents(remindHoursBefore: number): Promise<RemindTargetEvent[]>
  /**
   * イベントに対して未回答のユーザーを取得する
   * @param eventId イベントID
   * @returns 未回答ユーザーのリスト
   */
  findUnrespondedUsers(eventId: string): Promise<UnrespondedUser[]>
}
