import { InviteToken } from "@core/auth/domain/value_objects/invite_token.ts"
import { LineProfile } from "@core/auth/domain/entity/line_profile.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"
import {
  DEFAULT_LINE_ISSUER,
  verifyLineIdToken,
} from "@core/auth/domain/service/line_token_verifier.ts"
import type {
  InitialSignupDependencies,
  InitialSignupUseCaseRequest,
  InitialSignupUseCaseResponse,
} from "./types.ts"

export async function executeInitialSignupUseCase(
  request: InitialSignupUseCaseRequest,
  deps: InitialSignupDependencies,
): Promise<InitialSignupUseCaseResponse> {
  // LINE ID Tokenの検証
  const claims = await verifyLineIdToken(request.lineTokens.idToken, {
    jwksUrl: deps.lineJwksUrl,
    audience: deps.lineChannelId,
    issuer: deps.expectedLineIssuer ?? DEFAULT_LINE_ISSUER,
  })

  // LINE ProfileとID Tokenのユーザー一致チェック
  if (claims.sub !== request.lineProfile.lineUserId) {
    throw new InitialSignupError(
      "line_profile_mismatch",
      "LINE プロフィールと ID Token のユーザーが一致しません。",
      400,
    )
  }

  // 招待トークンの検証
  const inviteToken = InviteToken.fromRaw(request.inviteToken)
  const inviteTokenHash = await inviteToken.hash()
  await deps.inviteTokenRepository.findByHashAndValidate(inviteTokenHash)

  // 既存ユーザーチェック
  const existingUser = await deps.userRepository.findByLineId(claims.sub)
  if (existingUser) {
    return {
      userId: existingUser.id,
      sessionTransferToken: null,
    }
  }

  // Supabase Emailの生成
  const supabaseEmail = deriveSupabaseEmail(claims.sub, claims.email ?? null)

  // Supabase Authユーザー作成
  const authUserId = await deps.authService.createUser({
    email: supabaseEmail,
    lineUserId: claims.sub,
    displayName: request.lineProfile.displayName,
    avatarUrl: request.lineProfile.avatarUrl,
  })

  // ユーザーレコード作成
  await deps.userRepository.upsert({
    id: authUserId,
    lineUserId: claims.sub,
    status: "active",
  })

  // ユーザー詳細作成
  await deps.userDetailRepository.upsert({
    userId: authUserId,
    displayName: request.lineProfile.displayName,
    avatarUrl: request.lineProfile.avatarUrl,
    syncedDatetime: new Date(),
  })

  // セッショントークン発行
  const sessionTransferToken = await deps.authService.generateSessionToken(
    supabaseEmail,
  )

  return {
    userId: authUserId,
    sessionTransferToken,
  }
}

function deriveSupabaseEmail(lineUserId: string, claimedEmail: string | null) {
  if (claimedEmail && isValidEmail(claimedEmail)) {
    return claimedEmail.toLowerCase()
  }
  const normalizedId = lineUserId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  return `line_${normalizedId}@line.local`
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
