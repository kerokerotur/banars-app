import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IEventListRepository,
  RecentEventRow,
} from "@core/events/domain/irepository/event_list_repository.ts"
import { EventListError } from "@core/events/domain/errors/event_list_error.ts"

export class SupabaseEventListRepository implements IEventListRepository {
  constructor(private readonly client: SupabaseClient) {}

  async fetchRecent(limit: number): Promise<RecentEventRow[]> {
    const { data, error } = await this.client
      .from("events_recent_view")
      .select(
        "id, title, event_type_id, event_type_name, start_datetime, meeting_datetime, response_deadline_datetime, event_place_id, place_name, created_at, updated_at",
      )
      .order("start_datetime", { ascending: false })
      .limit(limit)

    if (error) {
      throw this.wrapError(error, "イベント一覧の取得に失敗しました")
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      eventTypeId: row.event_type_id,
      eventTypeName: row.event_type_name,
      startDatetime: row.start_datetime ? new Date(row.start_datetime) : null,
      meetingDatetime: row.meeting_datetime
        ? new Date(row.meeting_datetime)
        : null,
      responseDeadlineDatetime: row.response_deadline_datetime
        ? new Date(row.response_deadline_datetime)
        : null,
      eventPlaceId: row.event_place_id,
      placeName: row.place_name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  }

  private wrapError(error: PostgrestError, message: string) {
    return new EventListError("internal_error", message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}
