import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import { GoogleMapsUrlNormalized } from "@core/events/domain/value_objects/google_maps_url_normalized.ts"
import type {
  PlaceCreateDependencies,
  PlaceCreateUseCaseRequest,
  PlaceCreateUseCaseResponse,
} from "./types.ts"

export async function executePlaceCreateUseCase(
  request: PlaceCreateUseCaseRequest,
  deps: PlaceCreateDependencies,
): Promise<PlaceCreateUseCaseResponse> {
  const normalizedUrl = GoogleMapsUrlNormalized.create(request.googleMapsUrl)

  // 1. 場所名の重複チェック
  const existingPlace = await deps.placeManagementRepository.findByName(
    request.name,
  )
  if (existingPlace) {
    throw new PlaceManagementError(
      "duplicate_place_name",
      "この場所名は既に登録されています",
      400,
    )
  }

  // 2. Google Maps URL の重複チェック
  const duplicatedByUrl =
    await deps.placeManagementRepository.findByGoogleMapsUrlNormalized(
      normalizedUrl.rawValue,
    )

  if (duplicatedByUrl) {
    throw new PlaceManagementError(
      "duplicate_google_maps_url",
      "この Google Maps URL は既に登録されています",
      409,
      {
        existing_place: duplicatedByUrl.toResponse(),
      },
    )
  }

  // 3. 場所を作成
  const place = await deps.placeManagementRepository.create({
    name: request.name,
    googleMapsUrlNormalized: normalizedUrl.rawValue,
    createdUser: request.userId,
  })

  return {
    place,
  }
}
