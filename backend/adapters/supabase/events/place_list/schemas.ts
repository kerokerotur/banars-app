// place_list は GET エンドポイントのため、リクエストスキーマは不要
// レスポンス型のみ定義

import type { Place } from "@core/events/domain/entity/place.ts"

export interface PlaceListResponse {
  places: ReturnType<Place["toResponse"]>[]
}
