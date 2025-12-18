import type { Place } from "@core/events/domain/entity/place.ts"
import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

/**
 * 場所作成ユースケースのリクエスト
 */
export interface PlaceCreateUseCaseRequest {
  userId: string
  name: string
  googleMapsUrl: string
}

/**
 * 場所作成ユースケースのレスポンス
 */
export interface PlaceCreateUseCaseResponse {
  place: Place
}

/**
 * 場所作成ユースケースの依存関係
 */
export interface PlaceCreateDependencies {
  placeManagementRepository: IPlaceManagementRepository
}
