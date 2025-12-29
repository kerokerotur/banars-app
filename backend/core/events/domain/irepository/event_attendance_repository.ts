import type { UserAttendanceStatus } from "@core/events/usecases/event_list/types.ts"
import type { EventDetailResponse } from "@core/events/usecases/event_detail/types.ts"

export interface AttendanceSummaryItem {
  userId: string
  status: "attending" | "not_attending" | "pending"
}

export interface IEventAttendanceRepository {
  /**
   * 指定イベント群に対するユーザーの出欠ステータスを取得する
   * @returns Map<eventId, status>
   */
  findStatusesByUser(
    userId: string,
    eventIds: string[],
  ): Promise<Map<string, UserAttendanceStatus>>

  /**
   * 指定イベントの出欠一覧を取得する
   */
  findByEventId(eventId: string): Promise<EventDetailResponse>

  /**
   * 複数イベントの出欠者概要を一括取得（userId と status のみ）
   * @param eventIds イベントIDの配列
   * @returns Map<eventId, AttendanceSummaryItem[]>
   */
  findAttendancesSummaryByEventIds(
    eventIds: string[],
  ): Promise<Map<string, AttendanceSummaryItem[]>>
}
