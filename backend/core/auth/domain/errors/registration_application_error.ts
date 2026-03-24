export type RegistrationApplicationErrorCode =
  | "invalid_request"
  | "token_invalid"
  | "already_pending"
  | "already_registered"
  | "application_not_found"
  | "invalid_status"
  | "unauthorized"
  | "forbidden"
  | "internal_error"

export class RegistrationApplicationError extends Error {
  constructor(
    public readonly code: RegistrationApplicationErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "RegistrationApplicationError"
  }
}
