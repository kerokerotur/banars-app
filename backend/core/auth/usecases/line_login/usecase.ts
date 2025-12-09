import { LineLoginError } from "@core/auth/domain/errors/line_login_error.ts"
import {
  DEFAULT_LINE_ISSUER,
  verifyLineIdToken,
} from "@core/auth/domain/service/line_token_verifier.ts"
import { deriveSupabaseEmail } from "@core/auth/domain/service/email_derivation.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"
import type {
  LineLoginDependencies,
  LineLoginUseCaseRequest,
  LineLoginUseCaseResponse,
} from "./types.ts"

export async function executeLineLoginUseCase(
  request: LineLoginUseCaseRequest,
  deps: LineLoginDependencies,
): Promise<LineLoginUseCaseResponse> {
  // LINE ID Tokenの検証
  let claims
  try {
    claims = await verifyLineIdToken(request.idToken, {
      jwksUrl: deps.lineJwksUrl,
      audience: deps.lineChannelId,
      issuer: deps.expectedLineIssuer ?? DEFAULT_LINE_ISSUER,
    })
  } catch (error) {
    // InitialSignupError を LineLoginError に変換
    if (error instanceof InitialSignupError) {
      throw new LineLoginError(
        "token_invalid",
        error.message,
        error.status,
        error.details,
      )
    }
    throw error
  }

  // 既存ユーザー検索
  const existingUser = await deps.userRepository.findByLineId(claims.sub)
  if (!existingUser) {
    throw new LineLoginError(
      "user_not_found",
      "登録されていないユーザーです。招待リンクから初回登録を行ってください。",
      404,
    )
  }

  // ユーザーがブロックされていないか確認
  if (existingUser.status === "blocked") {
    throw new LineLoginError(
      "user_not_found",
      "このアカウントは利用できません。",
      403,
    )
  }

  // Supabase Email の再計算
  const supabaseEmail = deriveSupabaseEmail(claims.sub, claims.email ?? null)

  // セッショントークン発行
  let sessionTransferToken
  try {
    sessionTransferToken = await deps.authService.generateSessionToken(
      supabaseEmail,
    )
  } catch (error) {
    if (error instanceof InitialSignupError) {
      throw new LineLoginError(
        "internal_error",
        error.message,
        error.status,
        error.details,
      )
    }
    throw error
  }

  return {
    userId: existingUser.id,
    sessionTransferToken,
  }
}

