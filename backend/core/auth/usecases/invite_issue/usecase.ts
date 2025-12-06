import { hashInviteToken } from "../../entities/invite_token.ts"
import type { ValidatedInviteIssueRequest } from "./validators.ts"
import type { InviteIssueResult } from "./types.ts"

export async function executeInviteIssueUseCase(
  request: ValidatedInviteIssueRequest,
): Promise<InviteIssueResult> {
  const token = crypto.randomUUID()
  const tokenHash = await hashInviteToken(token)
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + request.expiresInDays)

  return {
    token,
    tokenHash,
    expiresAt,
  }
}

