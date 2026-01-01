export type EventDeleteErrorCode =
  | "validation_error"
  | "not_found"
  | "internal_error"

export class EventDeleteError extends Error {
  constructor(
    public readonly code: EventDeleteErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "EventDeleteError"
  }
}
