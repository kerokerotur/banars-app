import { InviteToken } from "@core/auth/domain/value_objects/invite_token.ts"
import type {
  ValidatedInviteIssueRequest,
  InviteIssueResult,
  InviteIssueDependencies,
} from "./types.ts"

export async function executeInviteIssueUseCase(
  request: ValidatedInviteIssueRequest,
  deps: InviteIssueDependencies,
): Promise<InviteIssueResult> {
  // 新しい招待トークンを生成
  const tokenValue = crypto.randomUUID()
  const inviteToken = InviteToken.fromRaw(tokenValue)
  const tokenHash = await inviteToken.hash()

  // ExpiresInDays値オブジェクトから有効期限を計算
  const expiresAt = request.expiresInDays.calculateExpiresAt()

  // リポジトリを使ってトークンを保存
  await deps.inviteTokenRepository.insert({
    tokenHash,
    expiresDatetime: expiresAt,
    issuedBy: request.issuedBy,
    createdUser: request.issuedBy,
  })

  return {
    token: tokenValue,
    expiresAt,
  }
}

