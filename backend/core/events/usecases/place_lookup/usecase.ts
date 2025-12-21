import { GoogleMapsUrlNormalized } from "@core/events/domain/value_objects/google_maps_url_normalized.ts"
import type {
  PlaceLookupDependencies,
  PlaceLookupUseCaseRequest,
  PlaceLookupUseCaseResponse,
} from "./types.ts"

export async function executePlaceLookupUseCase(
  request: PlaceLookupUseCaseRequest,
  deps: PlaceLookupDependencies,
): Promise<PlaceLookupUseCaseResponse> {
  const normalizedUrl = GoogleMapsUrlNormalized.create(request.googleMapsUrl)

  const place = await deps.placeManagementRepository.findByGoogleMapsUrlNormalized(
    normalizedUrl.rawValue,
  )

  if (!place) {
    return { exists: false }
  }

  return {
    exists: true,
    place,
  }
}
