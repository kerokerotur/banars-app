/**
 * イベント会場エンティティ
 * event_places テーブルを表現
 */
export interface EventPlacePayload {
  id: string
  name: string
  googleMapsUrl: string
  createdAt: Date
  createdUser: string | null
  updatedAt: Date
  updatedUser: string | null
}

export class EventPlace {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly googleMapsUrl: string,
    public readonly createdAt: Date,
    public readonly createdUser: string | null,
    public readonly updatedAt: Date,
    public readonly updatedUser: string | null,
  ) {}

  static fromPayload(payload: EventPlacePayload): EventPlace {
    return new EventPlace(
      payload.id,
      payload.name,
      payload.googleMapsUrl,
      payload.createdAt,
      payload.createdUser,
      payload.updatedAt,
      payload.updatedUser,
    )
  }

  toResponse(): {
    id: string
    name: string
    googleMapsUrl: string
  } {
    return {
      id: this.id,
      name: this.name,
      googleMapsUrl: this.googleMapsUrl,
    }
  }
}
