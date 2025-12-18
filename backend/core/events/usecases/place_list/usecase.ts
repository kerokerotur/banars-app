import type {
  PlaceListDependencies,
  PlaceListUseCaseRequest,
  PlaceListUseCaseResponse,
} from "./types.ts"

export async function executePlaceListUseCase(
  _request: PlaceListUseCaseRequest,
  deps: PlaceListDependencies,
): Promise<PlaceListUseCaseResponse> {
  const places = await deps.placeManagementRepository.findAll()

  return {
    places,
  }
}
