export type PlaceSearchErrorCode =
  | "validation_error"
  | "rate_limited"
  | "upstream_error"
  | "unexpected_response"

export class PlaceSearchError extends Error {
  constructor(
    public readonly code: PlaceSearchErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "PlaceSearchError"
  }
}
