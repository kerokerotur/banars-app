import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"
import type { UserAttendanceStatus } from "@core/events/usecases/event_list/types.ts"
import { EventListError } from "@core/events/domain/errors/event_list_error.ts"

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

  private wrapError(error: PostgrestError, message: string) {
    return new EventListError("internal_error", message, 500, {
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
