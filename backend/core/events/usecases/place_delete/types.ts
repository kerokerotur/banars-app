import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

/**
 * 場所削除ユースケースのリクエスト
 */
export interface PlaceDeleteUseCaseRequest {
  placeId: string
}

/**
 * 場所削除ユースケースのレスポンス
 */
export interface PlaceDeleteUseCaseResponse {
  success: true
}

/**
 * 場所削除ユースケースの依存関係
 */
export interface PlaceDeleteDependencies {
  placeManagementRepository: IPlaceManagementRepository
}
