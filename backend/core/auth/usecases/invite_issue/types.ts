export interface InviteIssueRequest {
  expiresInDays?: number
}

export interface InviteIssueResult {
  token: string
  tokenHash: string
  expiresAt: Date
}

