import { hashInviteToken } from "@core/auth/domain/entity/invite_token.ts"
import type { ValidatedInviteIssueRequest } from "./validators.ts"
import type { InviteIssueResult, InviteIssueDependencies } from "./types.ts"

export async function executeInviteIssueUseCase(
  request: ValidatedInviteIssueRequest,
  deps: InviteIssueDependencies,
): Promise<InviteIssueResult> {
  const token = crypto.randomUUID()
  const tokenHash = await hashInviteToken(token)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + request.expiresInDays)

  // リポジトリを使ってトークンを保存
  await deps.inviteTokenRepository.insert({
    tokenHash,
    expiresDatetime: expiresAt,
    issuedBy: request.issuedBy,
    createdUser: request.issuedBy,
  })

  return {
    token,
    expiresAt,
  }
}

