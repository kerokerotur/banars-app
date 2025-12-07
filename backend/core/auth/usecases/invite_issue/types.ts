import type { ExpirationPeriodDays } from "@core/auth/domain/value_objects/expiration_period_days.ts"

export interface InviteIssueRequest {
  expirationDays?: number
  issuedBy: string
}

export interface ValidatedInviteIssueRequest {
  expirationDays: ExpirationPeriodDays
  issuedBy: string
}

export interface InviteIssueResult {
  token: string
  expiresAt: Date
}

export interface InviteIssueDependencies {
  inviteTokenRepository: import("../../domain/irepository/invite_token_repository.ts").IInviteTokenRepository
}
