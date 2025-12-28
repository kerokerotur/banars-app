import type { AttendanceStatus, AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"

export interface AttendanceEventRecord {
  id: string
  responseDeadlineDatetime: Date | null
}

export interface UpsertAttendanceInput {
  eventId: string
  memberId: string
  status: AttendanceStatus
  comment?: string | null
}

export interface IAttendanceRepository {
  findEventById(eventId: string): Promise<AttendanceEventRecord | null>
  upsertAttendance(input: UpsertAttendanceInput): Promise<AttendanceRegisterResponse>
}
