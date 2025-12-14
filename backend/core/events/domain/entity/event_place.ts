/**
 * イベント会場エンティティ
 * event_places テーブルを表現
 */
export interface EventPlacePayload {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  osmId: number | null
  osmType: string | null
  placeFingerprint: string | null
  createdAt: Date
  createdUser: string | null
  updatedAt: Date
  updatedUser: string | null
}

export class EventPlace {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
    public readonly osmId: number | null,
    public readonly osmType: string | null,
    public readonly placeFingerprint: string | null,
    public readonly createdAt: Date,
    public readonly createdUser: string | null,
    public readonly updatedAt: Date,
    public readonly updatedUser: string | null,
  ) {}

  static fromPayload(payload: EventPlacePayload): EventPlace {
    return new EventPlace(
      payload.id,
      payload.name,
      payload.address,
      payload.latitude,
      payload.longitude,
      payload.osmId,
      payload.osmType,
      payload.placeFingerprint,
      payload.createdAt,
      payload.createdUser,
      payload.updatedAt,
      payload.updatedUser,
    )
  }

  toResponse(): {
    id: string
    name: string
    address: string
    latitude: number | null
    longitude: number | null
    osmId: number | null
    osmType: string | null
  } {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      osmId: this.osmId,
      osmType: this.osmType,
    }
  }
}
