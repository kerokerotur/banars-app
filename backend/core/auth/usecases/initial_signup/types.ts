export interface InitialSignupUseCaseRequest {
  inviteToken: string
  lineTokens: LineTokensPayload
  lineProfile: LineProfilePayload
}

export interface LineTokensPayload {
  idToken: string
  accessToken: string
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

export type { LineProfilePayload }
import type { LineProfilePayload } from "@core/auth/domain/entity/line_profile.ts"
