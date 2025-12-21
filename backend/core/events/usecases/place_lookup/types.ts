import type { Place } from "@core/events/domain/entity/place.ts"
import type { IPlaceManagementRepository } from "@core/events/domain/irepository/place_management_repository.ts"

export interface PlaceLookupUseCaseRequest {
  googleMapsUrl: string
}

export interface PlaceLookupUseCaseResponse {
  exists: boolean
  place?: Place
}

export interface PlaceLookupDependencies {
  placeManagementRepository: IPlaceManagementRepository
}
