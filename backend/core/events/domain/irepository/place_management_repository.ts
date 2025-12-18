import type { Place } from "../entity/place.ts"

/**
 * 場所作成時の入力データ
 */
export interface CreatePlaceInput {
  name: string
  googleMapsUrl: string
  createdUser: string
}

/**
 * 場所更新時の入力データ
 */
export interface UpdatePlaceInput {
  id: string
  name: string
  googleMapsUrl: string
  updatedUser: string
}

/**
 * 場所管理リポジトリインターフェース
 */
export interface IPlaceManagementRepository {
  /**
   * 全ての場所を取得（作成日時降順）
   */
  findAll(): Promise<Place[]>

  /**
   * IDで場所を取得
   */
  findById(id: string): Promise<Place | null>

  /**
   * 場所名で検索（重複チェック用）
   */
  findByName(name: string): Promise<Place | null>

  /**
   * 場所を作成
   */
  create(input: CreatePlaceInput): Promise<Place>

  /**
   * 場所を更新
   */
  update(input: UpdatePlaceInput): Promise<Place>

  /**
   * 場所を削除
   */
  delete(id: string): Promise<void>

  /**
   * 指定された場所IDを使用しているイベント数をカウント
   */
  countEventsByPlaceId(placeId: string): Promise<number>
}
