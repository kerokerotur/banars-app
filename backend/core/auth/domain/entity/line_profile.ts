import { InitialSignupError } from "../errors/initial_signup_error.ts"

export interface LineProfilePayload {
  lineUserId: string
  displayName: string
  avatarUrl?: string | null
}

export interface LineProfile {
  lineUserId: string
  displayName: string
  avatarUrl: string | null
}

export function buildLineProfile(
  payload: LineProfilePayload,
  fallbackName?: string | null,
): LineProfile {
  const displayNameSource =
    payload.displayName?.trim() || fallbackName?.trim() || ""
  return {
    lineUserId: normalizeLineUserId(payload.lineUserId),
    displayName: normalizeDisplayName(displayNameSource),
    avatarUrl: normalizeAvatarUrl(payload.avatarUrl),
  }
}

export function normalizeDisplayName(value: string): string {
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

export function normalizeAvatarUrl(
  value: string | null | undefined,
): string | null {
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

function normalizeLineUserId(value: string): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new InitialSignupError(
      "invalid_request",
      "lineProfile.lineUserId は必須です。",
      400,
    )
  }
  return trimmed
}
