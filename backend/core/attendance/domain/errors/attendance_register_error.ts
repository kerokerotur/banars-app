export type AttendanceRegisterErrorCode =
  | "validation_error"
  | "event_not_found"
  | "forbidden_after_deadline"
  | "internal_error"

export class AttendanceRegisterError extends Error {
  constructor(
    public code: AttendanceRegisterErrorCode,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "AttendanceRegisterError"
  }
}
