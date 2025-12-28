export type AttendanceStatus = "attending" | "not_attending" | "pending"

export interface AttendanceRegisterRequest {
  userId: string
  eventId: string
  status: AttendanceStatus
  comment?: string | null
}

export interface AttendanceRegisterResponse {
  id: string
  eventId: string
  memberId: string
  status: AttendanceStatus
  comment: string | null
  createdAt: Date
  updatedAt: Date
}
