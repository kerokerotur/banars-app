import { hashInviteToken } from "../../domain/entity/invite_token.ts"
import { buildLineProfile } from "../../domain/entity/line_profile.ts"
import { InitialSignupError } from "../../domain/errors/initial_signup_error.ts"
import {
  DEFAULT_LINE_ISSUER,
  verifyLineIdToken,
} from "../../domain/service/line_token_verifier.ts"
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

  const profile = buildLineProfile(
    request.lineProfile,
    claims.name ?? null,
  )

  if (claims.sub !== profile.lineUserId) {
    throw new InitialSignupError(
      "line_profile_mismatch",
      "LINE プロフィールと ID Token のユーザーが一致しません。",
      400,
    )
  }

  // 招待トークンの検証
  const inviteTokenHash = await hashInviteToken(request.inviteToken)
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
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
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
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
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
