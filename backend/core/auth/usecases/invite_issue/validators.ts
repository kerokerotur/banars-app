import { InviteIssueError } from "../../domain/errors/invite_issue_error.ts"
import type { InviteIssueRequest } from "./types.ts"

const DEFAULT_EXPIRES_IN_DAYS = 7
const MIN_EXPIRES_IN_DAYS = 1
const MAX_EXPIRES_IN_DAYS = 30

export interface ValidatedInviteIssueRequest {
  expiresInDays: number
  issuedBy: string
}

export function parseInviteIssueRequest(
  body: unknown,
  issuedBy: string,
): ValidatedInviteIssueRequest {
  if (body !== null && typeof body !== "object") {
    throw new InviteIssueError(
      "invalid_request",
      "リクエストボディはオブジェクトである必要があります。",
      400,
    )
  }

  const request = (body ?? {}) as InviteIssueRequest
  const expiresInDays = request.expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS

  if (typeof expiresInDays !== "number" || !Number.isInteger(expiresInDays)) {
    throw new InviteIssueError(
      "invalid_request",
      "expiresInDays は整数で指定してください。",
      400,
    )
  }

  if (expiresInDays < MIN_EXPIRES_IN_DAYS || expiresInDays > MAX_EXPIRES_IN_DAYS) {
    throw new InviteIssueError(
      "invalid_request",
      `expiresInDays は ${MIN_EXPIRES_IN_DAYS}〜${MAX_EXPIRES_IN_DAYS} の範囲で指定してください。`,
      400,
    )
  }

  return { expiresInDays, issuedBy }
}

