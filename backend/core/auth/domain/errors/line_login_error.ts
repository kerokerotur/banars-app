export type LineLoginErrorCode =
  | "invalid_request"
  | "token_invalid"
  | "token_expired"
  | "user_not_found"
  | "internal_error"

export class LineLoginError extends Error {
  constructor(
    public readonly code: LineLoginErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "LineLoginError"
  }
}

