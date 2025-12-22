import type { UserAttendanceStatus } from "@core/events/usecases/event_list/types.ts"

export interface IEventAttendanceRepository {
  /**
   * 指定イベント群に対するユーザーの出欠ステータスを取得する
   * @returns Map<eventId, status>
   */
  findStatusesByUser(
    userId: string,
    eventIds: string[],
  ): Promise<Map<string, UserAttendanceStatus>>
}
