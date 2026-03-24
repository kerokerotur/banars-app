import type { IRegistrationApplicationRepository } from "@core/auth/domain/irepository/registration_application_repository.ts"
import type { IUserRepository } from "@core/auth/domain/irepository/user_repository.ts"

export interface RegistrationApplyRequest {
  idToken: string
}

export interface RegistrationApplyResponse {
  applicationId: string
}

export interface RegistrationApplyDependencies {
  lineChannelId: string
  lineJwksUrl: string
  registrationApplicationRepository: IRegistrationApplicationRepository
  userRepository: IUserRepository
}
