import {
  DEFAULT_LINE_ISSUER,
  verifyLineIdToken,
} from "@core/auth/domain/service/line_token_verifier.ts"
import { RegistrationApplicationError } from "@core/auth/domain/errors/registration_application_error.ts"
import type {
  RegistrationApplyDependencies,
  RegistrationApplyRequest,
  RegistrationApplyResponse,
} from "./types.ts"

export async function executeRegistrationApplyUseCase(
  request: RegistrationApplyRequest,
  deps: RegistrationApplyDependencies,
): Promise<RegistrationApplyResponse> {
  // LINE ID Token の検証
  let claims
  try {
    claims = await verifyLineIdToken(request.idToken, {
      jwksUrl: deps.lineJwksUrl,
      audience: deps.lineChannelId,
      issuer: DEFAULT_LINE_ISSUER,
    })
  } catch {
    throw new RegistrationApplicationError(
      "token_invalid",
      "IDトークンの検証に失敗しました。",
      401,
    )
  }

  const lineUserId = claims.sub
  const displayName = claims.name ?? "名前未設定"
  const avatarUrl = claims.picture ?? null

  // 既存ユーザーチェック
  const existingUser = await deps.userRepository.findByLineId(lineUserId)
  if (existingUser) {
    throw new RegistrationApplicationError(
      "already_registered",
      "このLINEアカウントは既に登録済みです。",
      409,
    )
  }

  // pending 申請の重複チェック
  const pendingApp =
    await deps.registrationApplicationRepository.findPendingByLineUserId(
      lineUserId,
    )
  if (pendingApp) {
    throw new RegistrationApplicationError(
      "already_pending",
      "既に申請済みです。承認をお待ちください。",
      409,
    )
  }

  // 申請を登録
  const applicationId =
    await deps.registrationApplicationRepository.insert({
      lineUserId,
      displayName,
      avatarUrl,
    })

  return { applicationId }
}
