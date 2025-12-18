import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import type {
  PlaceCreateDependencies,
  PlaceCreateUseCaseRequest,
  PlaceCreateUseCaseResponse,
} from "./types.ts"

export async function executePlaceCreateUseCase(
  request: PlaceCreateUseCaseRequest,
  deps: PlaceCreateDependencies,
): Promise<PlaceCreateUseCaseResponse> {
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

  // 2. 場所を作成
  const place = await deps.placeManagementRepository.create({
    name: request.name,
    googleMapsUrl: request.googleMapsUrl,
    createdUser: request.userId,
  })

  return {
    place,
  }
}
