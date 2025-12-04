import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"

const DEFAULT_LINE_ISSUER = "https://access.line.me"

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export type InitialSignupErrorCode =
  | "invalid_request"
  | "line_token_invalid"
  | "line_profile_mismatch"
  | "token_not_found"
  | "token_expired"
  | "already_registered"
  | "internal_error"

export class InitialSignupError extends Error {
  constructor(
    public readonly code: InitialSignupErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "InitialSignupError"
  }
}

export interface InitialSignupDependencies {
  lineChannelId: string
  lineJwksUrl: string
  expectedLineIssuer?: string
}

export interface InitialSignupContext {
  inviteToken: string
  inviteTokenHash: string
  lineUserId: string
  lineDisplayName: string
  avatarUrl: string | null
  email: string | null
}

interface InitialSignupRequest {
  inviteToken: string
  lineTokens: {
    idToken: string
    accessToken: string
  }
  lineProfile: {
    lineUserId: string
    displayName: string
    avatarUrl?: string | null
  }
}

interface LineTokenVerificationOptions {
  jwksUrl: string
  audience: string
  issuer: string
}

interface LineIdTokenClaims extends JWTPayload {
  sub: string
  email?: string
  name?: string
}

export async function prepareInitialSignupContext(
  rawBody: unknown,
  deps: InitialSignupDependencies,
): Promise<InitialSignupContext> {
  const payload = parseRequest(rawBody)
  const claims = await verifyLineIdToken(payload.lineTokens.idToken, {
    jwksUrl: deps.lineJwksUrl,
    audience: deps.lineChannelId,
    issuer: deps.expectedLineIssuer ?? DEFAULT_LINE_ISSUER,
  })

  if (claims.sub !== payload.lineProfile.lineUserId) {
    throw new InitialSignupError(
      "line_profile_mismatch",
      "LINE プロフィールと ID Token のユーザーが一致しません。",
      400,
    )
  }

  const inviteTokenHash = await hashInviteToken(payload.inviteToken)
  const displayName = sanitizeDisplayName(
    payload.lineProfile.displayName ?? claims.name ?? "",
  )

  return {
    inviteToken: payload.inviteToken,
    inviteTokenHash,
    lineUserId: claims.sub,
    lineDisplayName: displayName,
    avatarUrl: sanitizeAvatarUrl(payload.lineProfile.avatarUrl),
    email: claims.email ? claims.email.toLowerCase() : null,
  }
}

export async function hashInviteToken(token: string): Promise<string> {
  const normalized = token.trim()
  if (!normalized) {
    throw new InitialSignupError(
      "invalid_request",
      "招待トークンが指定されていません。",
      400,
    )
  }
  const encoded = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function parseRequest(rawBody: unknown): InitialSignupRequest {
  if (!isRecord(rawBody)) {
    throw new InitialSignupError(
      "invalid_request",
      "JSON ボディはオブジェクト形式で送信してください。",
      400,
    )
  }

  const inviteToken = asString(rawBody.inviteToken, "inviteToken")
  const lineTokens = parseLineTokens(rawBody.lineTokens)
  const lineProfile = parseLineProfile(rawBody.lineProfile)

  return {
    inviteToken,
    lineTokens,
    lineProfile,
  }
}

function parseLineTokens(rawTokens: unknown): InitialSignupRequest["lineTokens"] {
  if (!isRecord(rawTokens)) {
    throw new InitialSignupError(
      "invalid_request",
      "lineTokens はオブジェクトで指定してください。",
      400,
    )
  }
  const idToken = asString(rawTokens.idToken, "lineTokens.idToken")
  const accessToken = asString(
    rawTokens.accessToken,
    "lineTokens.accessToken",
  )
  return { idToken, accessToken }
}

function parseLineProfile(
  rawProfile: unknown,
): InitialSignupRequest["lineProfile"] {
  if (!isRecord(rawProfile)) {
    throw new InitialSignupError(
      "invalid_request",
      "lineProfile はオブジェクトで指定してください。",
      400,
    )
  }
  const lineUserId = asString(rawProfile.lineUserId, "lineProfile.lineUserId")
  const displayName = asString(
    rawProfile.displayName,
    "lineProfile.displayName",
  )
  const avatarUrl =
    typeof rawProfile.avatarUrl === "string" ? rawProfile.avatarUrl : null
  return { lineUserId, displayName, avatarUrl }
}

async function verifyLineIdToken(
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

function sanitizeDisplayName(value: string): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new InitialSignupError(
      "invalid_request",
      "表示名を取得できませんでした。",
      400,
    )
  }
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed
}

function sanitizeAvatarUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  try {
    const url = new URL(trimmed)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null
    }
    return url.toString()
  } catch (_) {
    return null
  }
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new InitialSignupError(
      "invalid_request",
      `${field} は文字列で指定してください。`,
      400,
    )
  }
  return value.trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getJwks(url: string) {
  let jwks = jwksCache.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksCache.set(url, jwks)
  }
  return jwks
}
