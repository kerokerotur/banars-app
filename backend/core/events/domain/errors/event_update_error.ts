export type EventUpdateErrorCode =
  | "validation_error"
  | "not_found"
  | "event_type_not_found"
  | "event_place_not_found"
  | "internal_error"

export class EventUpdateError extends Error {
  constructor(
    public readonly code: EventUpdateErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "EventUpdateError"
  }
}
