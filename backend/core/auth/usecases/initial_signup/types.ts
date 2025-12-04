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
}

export interface InitialSignupUseCaseResponse {
  inviteToken: string
  inviteTokenHash: string
  lineUserId: string
  lineDisplayName: string
  avatarUrl: string | null
  email: string | null
}

export type { LineProfilePayload }
import type { LineProfilePayload } from "../../entities/line_profile.ts"
