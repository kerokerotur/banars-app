import type { IRegistrationApplicationRepository } from "@core/auth/domain/irepository/registration_application_repository.ts"

export interface RegistrationRejectRequest {
  applicationId: string
  rejecterId: string
}

export interface RegistrationRejectResponse {
  applicationId: string
}

export interface ILineMessagingService {
  pushMessage(lineUserId: string, text: string): Promise<void>
}

export interface RegistrationRejectDependencies {
  registrationApplicationRepository: IRegistrationApplicationRepository
  lineMessagingService: ILineMessagingService
}
