import type { Place } from "@core/events/domain/entity/place.ts"
import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

/**
 * 場所更新ユースケースのリクエスト
 */
export interface PlaceUpdateUseCaseRequest {
  userId: string
  placeId: string
  name: string
  googleMapsUrl: string
}

/**
 * 場所更新ユースケースのレスポンス
 */
export interface PlaceUpdateUseCaseResponse {
  place: Place
}

/**
 * 場所更新ユースケースの依存関係
 */
export interface PlaceUpdateDependencies {
  placeManagementRepository: IPlaceManagementRepository
}
