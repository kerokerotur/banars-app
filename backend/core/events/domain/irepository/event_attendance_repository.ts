import type { UserAttendanceStatus } from "@core/events/usecases/event_list/types.ts"
import type { EventDetailResponse } from "@core/events/usecases/event_detail/types.ts"

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
}
