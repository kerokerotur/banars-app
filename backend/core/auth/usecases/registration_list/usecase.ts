import type {
  RegistrationListDependencies,
  RegistrationListRequest,
  RegistrationListResponse,
} from "./types.ts"

export async function executeRegistrationListUseCase(
  request: RegistrationListRequest,
  deps: RegistrationListDependencies,
): Promise<RegistrationListResponse> {
  const status = request.status ?? "pending"
  const applications =
    await deps.registrationApplicationRepository.listByStatus(status)
  return { applications }
}
