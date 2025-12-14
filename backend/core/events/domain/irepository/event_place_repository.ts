import type { EventPlace } from "../entity/event_place.ts"

/**
 * イベント会場作成/更新時の入力データ
 */
export interface UpsertEventPlaceInput {
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  osmId: number | null
  osmType: string | null
  placeFingerprint: string | null
  createdUser: string | null
}

/**
 * イベント会場リポジトリインターフェース
 */
export interface IEventPlaceRepository {
  /**
   * 会場をUPSERTする
   * - OSM ID がある場合は (osm_type, osm_id) をキーに UPSERT
   * - 手入力の場合は place_fingerprint をキーに UPSERT
   */
  upsert(input: UpsertEventPlaceInput): Promise<EventPlace>
}
