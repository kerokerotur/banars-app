export interface EventDetailRequest {
  eventId: string
}

export interface EventAttendanceItem {
  id: string
  memberId: string
  displayName: string | null
  avatarUrl: string | null
  status: "attending" | "not_attending" | "pending"
  comment: string | null
  updatedAt: Date
}

export type EventDetailResponse = EventAttendanceItem[]
