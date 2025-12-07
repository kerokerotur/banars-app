import type { ExpiresInDays } from "@core/auth/domain/value_objects/expires_in_days.ts"

export interface InviteIssueRequest {
  expiresInDays?: number
  issuedBy: string
}

export interface ValidatedInviteIssueRequest {
  expiresInDays: ExpiresInDays
  issuedBy: string
}

export interface InviteIssueResult {
  token: string
  expiresAt: Date
}

export interface InviteIssueDependencies {
  inviteTokenRepository: import("../../domain/irepository/invite_token_repository.ts").IInviteTokenRepository
}

