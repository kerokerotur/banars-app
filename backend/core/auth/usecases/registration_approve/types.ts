import type { IRegistrationApplicationRepository } from "@core/auth/domain/irepository/registration_application_repository.ts"
import type { IUserRepository } from "@core/auth/domain/irepository/user_repository.ts"
import type { IUserDetailRepository } from "@core/auth/domain/irepository/user_detail_repository.ts"

export interface RegistrationApproveRequest {
  applicationId: string
  approverId: string
}

export interface RegistrationApproveResponse {
  userId: string
}

export interface ILineMessagingService {
  pushMessage(lineUserId: string, text: string): Promise<void>
}

export interface RegistrationApproveDependencies {
  registrationApplicationRepository: IRegistrationApplicationRepository
  userRepository: IUserRepository
  userDetailRepository: IUserDetailRepository
  lineMessagingService: ILineMessagingService
}
