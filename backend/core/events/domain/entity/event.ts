/**
 * イベントエンティティ
 * events テーブルを表現
 */
export interface EventPayload {
  id: string
  title: string
  eventTypeId: string
  startDatetime: Date | null
  meetingDatetime: Date | null
  responseDeadlineDatetime: Date | null
  eventPlaceId: string | null
  notesMarkdown: string | null
  createdAt: Date
  createdUser: string | null
  updatedAt: Date
  updatedUser: string | null
}

export class Event {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly eventTypeId: string,
    public readonly startDatetime: Date | null,
    public readonly meetingDatetime: Date | null,
    public readonly responseDeadlineDatetime: Date | null,
    public readonly eventPlaceId: string | null,
    public readonly notesMarkdown: string | null,
    public readonly createdAt: Date,
    public readonly createdUser: string | null,
    public readonly updatedAt: Date,
    public readonly updatedUser: string | null,
  ) {}

  static fromPayload(payload: EventPayload): Event {
    return new Event(
      payload.id,
      payload.title,
      payload.eventTypeId,
      payload.startDatetime,
      payload.meetingDatetime,
      payload.responseDeadlineDatetime,
      payload.eventPlaceId,
      payload.notesMarkdown,
      payload.createdAt,
      payload.createdUser,
      payload.updatedAt,
      payload.updatedUser,
    )
  }
}
