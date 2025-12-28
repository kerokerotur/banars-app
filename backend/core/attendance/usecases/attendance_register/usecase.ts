import { AttendanceRegisterError } from "@core/attendance/domain/errors/attendance_register_error.ts"
import type { IAttendanceRepository } from "@core/attendance/domain/irepository/attendance_repository.ts"
import type {
  AttendanceRegisterRequest,
  AttendanceRegisterResponse,
  AttendanceStatus,
} from "./types.ts"

export interface AttendanceRegisterDependencies {
  attendanceRepository: IAttendanceRepository
  nowProvider?: () => Date
}

const ALLOWED_STATUSES: AttendanceStatus[] = [
  "attending",
  "not_attending",
  "pending",
]

export async function executeAttendanceRegisterUseCase(
  request: AttendanceRegisterRequest,
  deps: AttendanceRegisterDependencies,
): Promise<AttendanceRegisterResponse> {
  validateRequest(request)

  const event = await deps.attendanceRepository.findEventById(request.eventId)
  if (!event) {
    throw new AttendanceRegisterError(
      "event_not_found",
      "イベントが見つかりません。",
      404,
    )
  }

  const now = deps.nowProvider ? deps.nowProvider() : new Date()
  if (
    event.responseDeadlineDatetime &&
    now > event.responseDeadlineDatetime
  ) {
    throw new AttendanceRegisterError(
      "forbidden_after_deadline",
      "締切後のため、出欠の変更はできません。",
      403,
    )
  }

  return deps.attendanceRepository.upsertAttendance({
    eventId: request.eventId,
    memberId: request.userId,
    status: request.status,
    comment: request.comment ?? null,
  })
}

function validateRequest(request: AttendanceRegisterRequest) {
  if (!request.eventId) {
    throw new AttendanceRegisterError(
      "validation_error",
      "eventId は必須です",
      400,
    )
  }
  if (!ALLOWED_STATUSES.includes(request.status)) {
    throw new AttendanceRegisterError(
      "validation_error",
      "status が不正です",
      400,
    )
  }
}
