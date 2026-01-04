import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IAttendanceRepository,
  RemindTargetEvent,
  UnrespondedUser,
  UpsertAttendanceInput,
} from "@core/attendance/domain/irepository/attendance_repository.ts"
import type { AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"
import { AttendanceRegisterError } from "@core/attendance/domain/errors/attendance_register_error.ts"

export class SupabaseAttendanceRepository implements IAttendanceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findEventById(eventId: string) {
    const { data, error } = await this.client
      .from("events")
      .select("id, response_deadline_datetime")
      .eq("id", eventId)
      .maybeSingle()

    if (error) {
      throw this.wrapError(error, "イベント情報の取得に失敗しました")
    }

    if (!data) return null

    return {
      id: data.id,
      responseDeadlineDatetime: data.response_deadline_datetime
        ? new Date(data.response_deadline_datetime)
        : null,
    }
  }

  async upsertAttendance(input: UpsertAttendanceInput): Promise<AttendanceRegisterResponse> {
    const { data, error } = await this.client
      .from("attendance")
      .upsert(
        {
          event_id: input.eventId,
          member_id: input.memberId,
          status: input.status,
          comment: input.comment ?? null,
          created_user: input.memberId,
          updated_user: input.memberId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,member_id" },
      )
      .select(
        "id, event_id, member_id, status, comment, created_at, updated_at",
      )
      .single()

    if (error) {
      throw this.wrapError(error, "出欠登録に失敗しました")
    }

    if (!data) {
      throw new AttendanceRegisterError(
        "internal_error",
        "出欠登録に失敗しました (データが返却されませんでした)",
        500,
      )
    }

    return {
      id: data.id,
      eventId: data.event_id,
      memberId: data.member_id,
      status: data.status,
      comment: data.comment,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  async findRemindTargetEvents(
    remindHoursBefore: number,
  ): Promise<RemindTargetEvent[]> {
    const now = new Date()
    const deadlineThreshold = new Date(
      now.getTime() + remindHoursBefore * 60 * 60 * 1000,
    )

    const { data, error } = await this.client
      .from("events")
      .select("id, title, response_deadline_datetime")
      .not("response_deadline_datetime", "is", null)
      .gt("response_deadline_datetime", now.toISOString())
      .lte("response_deadline_datetime", deadlineThreshold.toISOString())

    if (error) {
      throw this.wrapError(error, "リマインド対象イベントの取得に失敗しました")
    }

    return (
      data?.map((row) => ({
        id: row.id,
        title: row.title,
        responseDeadlineDatetime: new Date(row.response_deadline_datetime),
      })) ?? []
    )
  }

  async findUnrespondedUsers(eventId: string): Promise<UnrespondedUser[]> {
    // 1. すべてのアクティブユーザーを取得
    const { data: allUsers, error: usersError } = await this.client
      .from("user")
      .select("id")
      .eq("status", "active")

    if (usersError) {
      throw this.wrapError(usersError, "ユーザー一覧の取得に失敗しました")
    }

    if (!allUsers || allUsers.length === 0) {
      return []
    }

    // 2. 回答済み（status != 'pending'）のユーザーを取得
    const { data: respondedUsers, error: attendanceError } = await this.client
      .from("attendance")
      .select("member_id")
      .eq("event_id", eventId)
      .neq("status", "pending")

    if (attendanceError) {
      throw this.wrapError(
        attendanceError,
        "回答済みユーザーの取得に失敗しました",
      )
    }

    const respondedUserIds = new Set(
      respondedUsers?.map((row) => row.member_id) ?? [],
    )

    // 3. 回答済みユーザーを除外
    return allUsers
      .filter((user) => !respondedUserIds.has(user.id))
      .map((user) => ({ userId: user.id }))
  }

  private wrapError(error: PostgrestError, message: string) {
    return new AttendanceRegisterError("internal_error", message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}
