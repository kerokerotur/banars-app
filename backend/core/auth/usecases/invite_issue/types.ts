export interface InviteIssueRequest {
  expiresInDays?: number
  issuedBy: string
}

export interface InviteIssueResult {
  token: string
  expiresAt: Date
}

export interface InviteIssueDependencies {
  inviteTokenRepository: import("../../domain/irepository/invite_token_repository.ts").IInviteTokenRepository
}

