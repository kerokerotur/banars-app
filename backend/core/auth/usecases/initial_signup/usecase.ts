import { hashInviteToken } from "../../entities/invite_token.ts"
import { buildLineProfile } from "../../entities/line_profile.ts"
import { InitialSignupError } from "../../errors/initial_signup_error.ts"
import {
  DEFAULT_LINE_ISSUER,
  verifyLineIdToken,
} from "../../services/line_token_verifier.ts"
import type {
  InitialSignupDependencies,
  InitialSignupUseCaseRequest,
  InitialSignupUseCaseResponse,
} from "./types.ts"

export async function executeInitialSignupUseCase(
  request: InitialSignupUseCaseRequest,
  deps: InitialSignupDependencies,
): Promise<InitialSignupUseCaseResponse> {
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

  const inviteTokenHash = await hashInviteToken(request.inviteToken)

  return {
    inviteToken: request.inviteToken,
    inviteTokenHash,
    lineUserId: claims.sub,
    lineDisplayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    email: claims.email ? claims.email.toLowerCase() : null,
  }
}
