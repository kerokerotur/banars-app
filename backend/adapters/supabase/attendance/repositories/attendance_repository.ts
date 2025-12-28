import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type { IAttendanceRepository } from "@core/attendance/domain/irepository/attendance_repository.ts"
import type { AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"
import type { UpsertAttendanceInput } from "@core/attendance/domain/irepository/attendance_repository.ts"
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

  private wrapError(error: PostgrestError, message: string) {
    return new AttendanceRegisterError("internal_error", message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}
