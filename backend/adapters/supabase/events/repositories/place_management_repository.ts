import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IPlaceManagementRepository,
  CreatePlaceInput,
  UpdatePlaceInput,
} from "@core/events/domain/irepository/place_management_repository.ts"
import { Place } from "@core/events/domain/entity/place.ts"
import {
  PlaceManagementError,
  type PlaceManagementErrorCode,
} from "@core/events/domain/errors/place_management_error.ts"

/**
 * Supabase実装の場所管理リポジトリ
 */
export class SupabasePlaceManagementRepository
  implements IPlaceManagementRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findAll(): Promise<Place[]> {
    const { data, error } = await this.client
      .from("event_places")
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .order("created_at", { ascending: false })

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所一覧の取得に失敗しました",
      )
    }

    return (data || []).map((row) =>
      Place.fromPayload({
        id: row.id,
        name: row.name,
        googleMapsUrlNormalized: row.google_maps_url_normalized,
        createdAt: new Date(row.created_at),
        createdUser: row.created_user,
        updatedAt: new Date(row.updated_at),
        updatedUser: row.updated_user,
      }),
    )
  }

  async findById(id: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from("event_places")
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .eq("id", id)
      .single()

    if (error) {
      // PGRST116: 0 rows returned (not found)
      if (error.code === "PGRST116") {
        return null
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の取得に失敗しました",
      )
    }

    if (!data) {
      return null
    }

    return Place.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrlNormalized: data.google_maps_url_normalized,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  async findByName(name: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from("event_places")
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .eq("name", name)
      .single()

    if (error) {
      // PGRST116: 0 rows returned (not found)
      if (error.code === "PGRST116") {
        return null
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の取得に失敗しました",
      )
    }

    if (!data) {
      return null
    }

    return Place.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrlNormalized: data.google_maps_url_normalized,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  async findByGoogleMapsUrlNormalized(url: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from("event_places")
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .eq("google_maps_url_normalized", url)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の取得に失敗しました",
      )
    }

    if (!data) {
      return null
    }

    return Place.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrlNormalized: data.google_maps_url_normalized,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  async create(input: CreatePlaceInput): Promise<Place> {
    const { data, error } = await this.client
      .from("event_places")
      .insert({
        name: input.name,
        google_maps_url_normalized: input.googleMapsUrlNormalized,
        created_user: input.createdUser,
      })
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .single()

    if (error) {
      // 23505: unique_violation (UNIQUE制約違反)
      if (error.code === "23505") {
        const isUrlConstraint =
          error.message?.includes("event_places_google_maps_url_norm_idx") ??
          false
        if (isUrlConstraint) {
          throw new PlaceManagementError(
            "duplicate_google_maps_url",
            "この Google Maps URL は既に登録されています",
            409,
          )
        }
        throw new PlaceManagementError(
          "duplicate_place_name",
          "この場所名は既に登録されています",
          400,
        )
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の作成に失敗しました",
      )
    }

    if (!data) {
      throw new PlaceManagementError(
        "internal_error",
        "場所の作成に失敗しました (データが返却されませんでした)",
        500,
      )
    }

    return Place.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrlNormalized: data.google_maps_url_normalized,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  async update(input: UpdatePlaceInput): Promise<Place> {
    const { data, error } = await this.client
      .from("event_places")
      .update({
        name: input.name,
        google_maps_url_normalized: input.googleMapsUrlNormalized,
        updated_user: input.updatedUser,
      })
      .eq("id", input.id)
      .select(
        "id, name, google_maps_url_normalized, created_at, created_user, updated_at, updated_user",
      )
      .single()

    if (error) {
      // 23505: unique_violation (UNIQUE制約違反)
      if (error.code === "23505") {
        const isUrlConstraint =
          error.message?.includes("event_places_google_maps_url_norm_idx") ??
          false
        if (isUrlConstraint) {
          throw new PlaceManagementError(
            "duplicate_google_maps_url",
            "この Google Maps URL は既に登録されています",
            409,
          )
        }
        throw new PlaceManagementError(
          "duplicate_place_name",
          "この場所名は既に登録されています",
          400,
        )
      }
      // PGRST116: 0 rows returned (not found)
      if (error.code === "PGRST116") {
        throw new PlaceManagementError(
          "place_not_found",
          "指定された場所が見つかりません",
          404,
        )
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の更新に失敗しました",
      )
    }

    if (!data) {
      throw new PlaceManagementError(
        "place_not_found",
        "指定された場所が見つかりません",
        404,
      )
    }

    return Place.fromPayload({
      id: data.id,
      name: data.name,
      googleMapsUrlNormalized: data.google_maps_url_normalized,
      createdAt: new Date(data.created_at),
      createdUser: data.created_user,
      updatedAt: new Date(data.updated_at),
      updatedUser: data.updated_user,
    })
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("event_places")
      .delete()
      .eq("id", id)

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "場所の削除に失敗しました",
      )
    }
  }

  async countEventsByPlaceId(placeId: string): Promise<number> {
    const { count, error } = await this.client
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("event_place_id", placeId)

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "イベント数の取得に失敗しました",
      )
    }

    return count || 0
  }

  private wrapPostgrestError(
    error: PostgrestError,
    code: PlaceManagementErrorCode,
    message: string,
  ) {
    return new PlaceManagementError(code, message, 500, {
      reason: error.message,
      details: error.details,
      code: error.code,
    })
  }
}
