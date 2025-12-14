import type { Event } from "./event.ts"
import type { EventPlace } from "./event_place.ts"

/**
 * イベント作成結果を表すエンティティ
 * イベント本体と会場情報を組み合わせた情報
 */
export class CreatedEvent {
  constructor(
    public readonly event: Event,
    public readonly place: EventPlace,
  ) {}

  toResponse(): {
    success: boolean
    event: {
      id: string
      title: string
      eventTypeId: string
      startDatetime: string | null
      meetingDatetime: string | null
      responseDeadlineDatetime: string | null
      eventPlaceId: string | null
      notesMarkdown: string | null
      createdAt: string
      place: {
        id: string
        name: string
        address: string
        latitude: number | null
        longitude: number | null
        osmId: number | null
        osmType: string | null
      }
    }
  } {
    return {
      success: true,
      event: {
        id: this.event.id,
        title: this.event.title,
        eventTypeId: this.event.eventTypeId,
        startDatetime: this.event.startDatetime?.toISOString() ?? null,
        meetingDatetime: this.event.meetingDatetime?.toISOString() ?? null,
        responseDeadlineDatetime:
          this.event.responseDeadlineDatetime?.toISOString() ?? null,
        eventPlaceId: this.event.eventPlaceId,
        notesMarkdown: this.event.notesMarkdown,
        createdAt: this.event.createdAt.toISOString(),
        place: this.place.toResponse(),
      },
    }
  }
}
