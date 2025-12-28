export class EventDetailError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public meta?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "EventDetailError"
  }
}
