import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"
import type {
  InitialSignupUseCaseRequest,
  LineProfilePayload,
  LineTokensPayload,
} from "./types.ts"

export function parseInitialSignupRequest(
  rawBody: unknown,
): InitialSignupUseCaseRequest {
  if (!isRecord(rawBody)) {
    throw new InitialSignupError(
      "invalid_request",
      "JSON ボディはオブジェクト形式で送信してください。",
      400,
    )
  }

  return {
    inviteToken: asString(rawBody.inviteToken, "inviteToken"),
    lineTokens: parseLineTokens(rawBody.lineTokens),
    lineProfile: parseLineProfile(rawBody.lineProfile),
  }
}

function parseLineTokens(rawTokens: unknown): LineTokensPayload {
  if (!isRecord(rawTokens)) {
    throw new InitialSignupError(
      "invalid_request",
      "lineTokens はオブジェクトで指定してください。",
      400,
    )
  }
  return {
    idToken: asString(rawTokens.idToken, "lineTokens.idToken"),
    accessToken: asString(rawTokens.accessToken, "lineTokens.accessToken"),
  }
}

function parseLineProfile(rawProfile: unknown): LineProfilePayload {
  if (!isRecord(rawProfile)) {
    throw new InitialSignupError(
      "invalid_request",
      "lineProfile はオブジェクトで指定してください。",
      400,
    )
  }
  return {
    lineUserId: asString(rawProfile.lineUserId, "lineProfile.lineUserId"),
    displayName: asString(rawProfile.displayName, "lineProfile.displayName"),
    avatarUrl:
      typeof rawProfile.avatarUrl === "string" ? rawProfile.avatarUrl : null,
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
