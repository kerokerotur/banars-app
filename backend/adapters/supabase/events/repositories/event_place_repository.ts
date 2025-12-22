import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IEventPlaceRepository,
  UpsertEventPlaceInput,
} from "@core/events/domain/irepository/event_place_repository.ts"
import { EventPlace } from "@core/events/domain/entity/event_place.ts"
import {
  EventCreateError,
  type EventCreateErrorCode,
} from "@core/events/domain/errors/event_create_error.ts"

/**
 * Supabase実装のイベント会場リポジトリ
 */
export class SupabaseEventPlaceRepository implements IEventPlaceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsert(input: UpsertEventPlaceInput): Promise<EventPlace> {
    // 会場名 (name) でUPSERT
    const { data, error } = await this.client
      .from("event_places")
      .upsert(
        {
          name: input.name,
          google_maps_url_normalized: input.googleMapsUrl,
          created_user: input.createdUser,
        },
        {
          onConflict: "name",
          ignoreDuplicates: false, // 既存レコードも更新する
        },
      )
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .single()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "会場情報の保存に失敗しました",
      )
    }

    if (!data) {
      throw new EventCreateError(
        "internal_error",
        "会場情報の保存に失敗しました (データが返却されませんでした)",
        500,
      )
    }

    return EventPlace.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrl: data.google_maps_url_normalized,
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
