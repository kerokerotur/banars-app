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
