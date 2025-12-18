/**
 * 場所エンティティ
 * event_places テーブルを表現（Google Maps URL ベース）
 */
export interface PlacePayload {
  id: string
  name: string
  googleMapsUrl: string
  createdAt: Date
  createdUser: string | null
  updatedAt: Date
  updatedUser: string | null
}

export class Place {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly googleMapsUrl: string,
    public readonly createdAt: Date,
    public readonly createdUser: string | null,
    public readonly updatedAt: Date,
    public readonly updatedUser: string | null,
  ) {}

  static fromPayload(payload: PlacePayload): Place {
    return new Place(
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
    google_maps_url: string
    created_at: string
  } {
    return {
      id: this.id,
      name: this.name,
      google_maps_url: this.googleMapsUrl,
      created_at: this.createdAt.toISOString(),
    }
  }
}
