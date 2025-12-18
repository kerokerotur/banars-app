import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import type {
  PlaceUpdateDependencies,
  PlaceUpdateUseCaseRequest,
  PlaceUpdateUseCaseResponse,
} from "./types.ts"

export async function executePlaceUpdateUseCase(
  request: PlaceUpdateUseCaseRequest,
  deps: PlaceUpdateDependencies,
): Promise<PlaceUpdateUseCaseResponse> {
  // 1. 更新対象の場所が存在するか確認
  const targetPlace = await deps.placeManagementRepository.findById(
    request.placeId,
  )
  if (!targetPlace) {
    throw new PlaceManagementError(
      "place_not_found",
      "指定された場所が見つかりません",
      404,
    )
  }

  // 2. 場所名の重複チェック（自分自身以外）
  const existingPlace = await deps.placeManagementRepository.findByName(
    request.name,
  )
  if (existingPlace && existingPlace.id !== request.placeId) {
    throw new PlaceManagementError(
      "duplicate_place_name",
      "この場所名は既に登録されています",
      400,
    )
  }

  // 3. 場所を更新
  const place = await deps.placeManagementRepository.update({
    id: request.placeId,
    name: request.name,
    googleMapsUrl: request.googleMapsUrl,
    updatedUser: request.userId,
  })

  return {
    place,
  }
}
