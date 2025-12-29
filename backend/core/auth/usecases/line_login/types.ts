import type { IUserRepository } from "@core/auth/domain/irepository/user_repository.ts"
import type { IAuthService } from "@core/auth/domain/service/iauth_service.ts"

export interface LineLoginUseCaseRequest {
  idToken: string
}

export interface LineLoginUseCaseResponse {
  userId: string
  sessionTransferToken: string
}

export interface LineLoginDependencies {
  lineChannelId: string
  lineJwksUrl: string
  expectedLineIssuer?: string
  userRepository: IUserRepository
  authService: IAuthService
}


