export type GetMeErrorCode =
  | "unauthorized"
  | "user_not_found"
  | "internal_error"

export class GetMeError extends Error {
  constructor(
    public readonly code: GetMeErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "GetMeError"
  }
}

