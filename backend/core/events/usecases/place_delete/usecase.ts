import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import type {
  PlaceDeleteDependencies,
  PlaceDeleteUseCaseRequest,
  PlaceDeleteUseCaseResponse,
} from "./types.ts"

export async function executePlaceDeleteUseCase(
  request: PlaceDeleteUseCaseRequest,
  deps: PlaceDeleteDependencies,
): Promise<PlaceDeleteUseCaseResponse> {
  // 1. 削除対象の場所が存在するか確認
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

  // 2. 使用中のイベントがないか確認
  const eventCount = await deps.placeManagementRepository.countEventsByPlaceId(
    request.placeId,
  )
  if (eventCount > 0) {
    throw new PlaceManagementError(
      "place_in_use",
      "この場所は既存のイベントで使用されているため削除できません",
      400,
      { event_count: eventCount },
    )
  }

  // 3. 場所を削除
  await deps.placeManagementRepository.delete(request.placeId)

  return {
    success: true,
  }
}
