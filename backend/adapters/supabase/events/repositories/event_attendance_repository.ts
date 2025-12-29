import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IEventAttendanceRepository,
  AttendanceSummaryItem,
} from "@core/events/domain/irepository/event_attendance_repository.ts"
import type { UserAttendanceStatus } from "@core/events/usecases/event_list/types.ts"
import { EventListError } from "@core/events/domain/errors/event_list_error.ts"
import { EventDetailError } from "@core/events/domain/errors/event_detail_error.ts"

export class SupabaseEventAttendanceRepository
  implements IEventAttendanceRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findStatusesByUser(
    userId: string,
    eventIds: string[],
  ): Promise<Map<string, UserAttendanceStatus>> {
    if (eventIds.length === 0) return new Map()

    const { data, error } = await this.client
      .from("attendance")
      .select("event_id, status")
      .in("event_id", eventIds)
      .eq("member_id", userId)

    if (error) {
      throw this.wrapError(error, "出欠情報の取得に失敗しました")
    }

    const map = new Map<string, UserAttendanceStatus>()
    for (const row of data ?? []) {
      map.set(row.event_id, mapAttendanceStatus(row.status))
    }
    return map
  }

  async findByEventId(eventId: string) {
    const { data, error } = await this.client
      .from("attendance")
      .select("id, member_id, status, comment, updated_at")
      .eq("event_id", eventId)
      .order("updated_at", { ascending: false })

    if (error) {
      throw this.wrapDetailError(error, "出欠一覧の取得に失敗しました")
    }

    const attendanceRows = data ?? []
    const memberIds = attendanceRows.map((row) => row.member_id)

    let userMap = new Map<string, any>()
    if (memberIds.length > 0) {
      const { data: userDetails, error: userError } = await this.client
        .from("user_detail")
        .select("user_id, display_name, avatar_url")
        .in("user_id", memberIds)

      if (userError) {
        throw this.wrapDetailError(userError, "ユーザー情報の取得に失敗しました")
      }

      userMap = new Map((userDetails ?? []).map((u) => [u.user_id as string, u]))
    }

    return attendanceRows.map((row) => {
      const user = userMap.get(row.member_id)
      return {
        id: row.id,
        memberId: row.member_id,
        displayName: user?.display_name ?? null,
        avatarUrl: user?.avatar_url ?? null,
        status: row.status,
        comment: row.comment,
        updatedAt: new Date(row.updated_at),
      }
    })
  }

  private wrapError(error: PostgrestError, message: string) {
    return new EventListError("internal_error", message, 500, {
      reason: error.message,
      details: error.details,
    })
  }

  async findAttendancesSummaryByEventIds(
    eventIds: string[],
  ): Promise<Map<string, AttendanceSummaryItem[]>> {
    if (eventIds.length === 0) return new Map()

    // IN句で一括取得
    const { data, error } = await this.client
      .from("attendance")
      .select("event_id, member_id, status, updated_at")
      .in("event_id", eventIds)

    if (error) {
      throw this.wrapError(error, "出欠情報の取得に失敗しました")
    }

    // イベントごとにグループ化
    const grouped = new Map<string, any[]>()
    for (const row of data ?? []) {
      if (!grouped.has(row.event_id)) {
        grouped.set(row.event_id, [])
      }
      grouped.get(row.event_id)!.push(row)
    }

    // 各イベントの出欠者をソート（attending優先 → 更新日時降順）
    const result = new Map<string, AttendanceSummaryItem[]>()
    for (const [eventId, rows] of grouped) {
      const sorted = rows
        .sort((a, b) => {
          if (a.status !== b.status) {
            return a.status.localeCompare(b.status) // attending優先
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        })
        .map((row) => ({
          userId: row.member_id,
          status: row.status,
        }))

      result.set(eventId, sorted)
    }

    return result
  }

  private wrapDetailError(error: PostgrestError, message: string) {
    return new EventDetailError("internal_error", message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}

function mapAttendanceStatus(status: string): UserAttendanceStatus {
  switch (status) {
    case "attending":
      return "participating"
    case "not_attending":
      return "absent"
    case "pending":
      return "pending"
    default:
      return "unanswered"
  }
}
