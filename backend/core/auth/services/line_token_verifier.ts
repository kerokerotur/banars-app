import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from "jose"

import { InitialSignupError } from "../errors/initial_signup_error.ts"

export const DEFAULT_LINE_ISSUER = "https://access.line.me"

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export interface LineTokenVerificationOptions {
  jwksUrl: string
  audience: string
  issuer: string
}

export interface LineIdTokenClaims extends JWTPayload {
  sub: string
  email?: string
  name?: string
}

export async function verifyLineIdToken(
  token: string,
  options: LineTokenVerificationOptions,
): Promise<LineIdTokenClaims> {
  if (!token) {
    throw new InitialSignupError(
      "line_token_invalid",
      "LINE ID Token が空です。",
      400,
    )
  }
  const jwks = getJwks(options.jwksUrl)
  try {
    const result = await jwtVerify(token, jwks, {
      audience: options.audience,
      issuer: options.issuer,
    })
    const payload = result.payload as LineIdTokenClaims
    if (!payload.sub) {
      throw new InitialSignupError(
        "line_token_invalid",
        "LINE ID Token に sub が含まれていません。",
        400,
      )
    }
    return payload
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new InitialSignupError(
      "line_token_invalid",
      "LINE ID Token の検証に失敗しました。",
      401,
      { reason: message },
    )
  }
}

function getJwks(url: string) {
  let jwks = jwksCache.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksCache.set(url, jwks)
  }
  return jwks
}
