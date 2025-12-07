import type { LineTokens } from "@core/auth/domain/value_objects/line_tokens.ts"
import type { LineProfile } from "@core/auth/domain/entity/line_profile.ts"

export interface InitialSignupUseCaseRequest {
  inviteToken: string
  lineTokens: LineTokens
  lineProfile: LineProfile
}

export interface InitialSignupDependencies {
  lineChannelId: string
  lineJwksUrl: string
  expectedLineIssuer?: string
  inviteTokenRepository: import("../../domain/irepository/invite_token_repository.ts").IInviteTokenRepository
  userRepository: import("../../domain/irepository/user_repository.ts").IUserRepository
  userDetailRepository: import("../../domain/irepository/user_detail_repository.ts").IUserDetailRepository
  authService: import("../../domain/service/iauth_service.ts").IAuthService
}

export interface InitialSignupUseCaseResponse {
  userId: string
  sessionTransferToken: string | null
}
