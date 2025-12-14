export type EventCreateErrorCode =
  | "validation_error"
  | "unauthorized"
  | "event_type_not_found"
  | "internal_error"

export class EventCreateError extends Error {
  constructor(
    public readonly code: EventCreateErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "EventCreateError"
  }
}
