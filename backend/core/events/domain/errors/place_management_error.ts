export type PlaceManagementErrorCode =
  | "validation_error"
  | "unauthorized"
  | "place_not_found"
  | "duplicate_place_name"
  | "place_in_use"
  | "internal_error"

export class PlaceManagementError extends Error {
  constructor(
    public readonly code: PlaceManagementErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "PlaceManagementError"
  }
}
