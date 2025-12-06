export type InviteIssueErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_request"
  | "internal_error"

export class InviteIssueError extends Error {
  constructor(
    public readonly code: InviteIssueErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "InviteIssueError"
  }
}

