import { InitialSignupError } from "../errors/initial_signup_error.ts"

export async function hashInviteToken(token: string): Promise<string> {
  const normalized = normalizeInviteToken(token)
  const encoded = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export function normalizeInviteToken(token: string): string {
  const normalized = token?.trim()
  if (!normalized) {
    throw new InitialSignupError(
      "invalid_request",
      "招待トークンが指定されていません。",
      400,
    )
  }
  return normalized
}
