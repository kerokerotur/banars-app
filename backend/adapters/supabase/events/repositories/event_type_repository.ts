import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type { IEventTypeRepository } from "@core/events/domain/irepository/event_type_repository.ts"
import {
  EventCreateError,
  type EventCreateErrorCode,
} from "@core/events/domain/errors/event_create_error.ts"

/**
 * Supabase実装のイベント種別リポジトリ
 */
export class SupabaseEventTypeRepository implements IEventTypeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async exists(eventTypeId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("event_types")
      .select("id")
      .eq("id", eventTypeId)
      .maybeSingle()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "イベント種別の確認に失敗しました",
      )
    }

    return data !== null
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
