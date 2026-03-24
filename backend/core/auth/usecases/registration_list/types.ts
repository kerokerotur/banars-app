import type { IRegistrationApplicationRepository, RegistrationApplication } from "@core/auth/domain/irepository/registration_application_repository.ts"

export interface RegistrationListRequest {
  status?: "pending" | "approved" | "rejected"
}

export interface RegistrationListResponse {
  applications: RegistrationApplication[]
}

export interface RegistrationListDependencies {
  registrationApplicationRepository: IRegistrationApplicationRepository
}
