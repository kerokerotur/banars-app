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
    // OSM IDがある場合: (osm_type, osm_id) でUPSERT
    // 手入力の場合: place_fingerprint でUPSERT
    const onConflict =
      input.osmId !== null ? "osm_type,osm_id" : "place_fingerprint"

    const { data, error } = await this.client
      .from("event_places")
      .upsert(
        {
          name: input.name,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          osm_id: input.osmId,
          osm_type: input.osmType,
          place_fingerprint: input.placeFingerprint,
          created_user: input.createdUser,
        },
        {
          onConflict,
          ignoreDuplicates: false, // 既存レコードも更新する
        },
      )
      .select(
        "id, name, address, latitude, longitude, osm_id, osm_type, place_fingerprint, created_at, created_user, updated_at, updated_user",
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
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      osmId: data.osm_id,
      osmType: data.osm_type,
      placeFingerprint: data.place_fingerprint,
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
