import type { EventPlace } from "../entity/event_place.ts"

/**
 * イベント会場作成/更新時の入力データ
 */
export interface UpsertEventPlaceInput {
  name: string
  googleMapsUrl: string
  createdUser: string | null
}

/**
 * イベント会場リポジトリインターフェース
 */
export interface IEventPlaceRepository {
  /**
   * 会場をUPSERTする
   * - 会場名 (name) をキーに UPSERT
   */
  upsert(input: UpsertEventPlaceInput): Promise<EventPlace>
}
