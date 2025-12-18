import type { Place } from "@core/events/domain/entity/place.ts"
import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

/**
 * 場所一覧取得ユースケースのリクエスト
 */
export interface PlaceListUseCaseRequest {
  // クエリパラメータなし
}

/**
 * 場所一覧取得ユースケースのレスポンス
 */
export interface PlaceListUseCaseResponse {
  places: Place[]
}

/**
 * 場所一覧取得ユースケースの依存関係
 */
export interface PlaceListDependencies {
  placeManagementRepository: IPlaceManagementRepository
}
