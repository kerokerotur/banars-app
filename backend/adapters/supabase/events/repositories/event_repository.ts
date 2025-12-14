import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IEventRepository,
  CreateEventInput,
} from "@core/events/domain/irepository/event_repository.ts"
import { Event } from "@core/events/domain/entity/event.ts"
import {
  EventCreateError,
  type EventCreateErrorCode,
} from "@core/events/domain/errors/event_create_error.ts"

/**
 * Supabase実装のイベントリポジトリ
 */
export class SupabaseEventRepository implements IEventRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateEventInput): Promise<Event> {
    const { data, error } = await this.client
      .from("events")
      .insert({
        title: input.title,
        event_type_id: input.eventTypeId,
        start_datetime: input.startDatetime?.toISOString() ?? null,
        meeting_datetime: input.meetingDatetime?.toISOString() ?? null,
        response_deadline_datetime:
          input.responseDeadlineDatetime?.toISOString() ?? null,
        event_place_id: input.eventPlaceId,
        notes_markdown: input.notesMarkdown,
        created_user: input.createdUser,
      })
      .select(
        "id, title, event_type_id, start_datetime, meeting_datetime, response_deadline_datetime, event_place_id, notes_markdown, created_at, created_user, updated_at, updated_user",
      )
      .single()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "イベントの作成に失敗しました",
      )
    }

    if (!data) {
      throw new EventCreateError(
        "internal_error",
        "イベントの作成に失敗しました (データが返却されませんでした)",
        500,
      )
    }

    return Event.fromPayload({
      id: data.id,
      title: data.title,
      eventTypeId: data.event_type_id,
      startDatetime: data.start_datetime ? new Date(data.start_datetime) : null,
      meetingDatetime: data.meeting_datetime
        ? new Date(data.meeting_datetime)
        : null,
      responseDeadlineDatetime: data.response_deadline_datetime
        ? new Date(data.response_deadline_datetime)
        : null,
      eventPlaceId: data.event_place_id,
      notesMarkdown: data.notes_markdown,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  private wrapPostgrestError(
    error: PostgrestError,
    code: EventCreateErrorCode,
    message: string,
  ) {
    return new EventCreateError(code, message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}
