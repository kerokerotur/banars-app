export interface SearchPlacesUseCaseRequest {
  query: string
  limit?: number
  countryCodes?: string[]
}

export interface SearchPlaceResult {
  placeId: number
  displayName: string
  lat: string
  lon: string
  osmId: number | null
  osmType: string | null
  address: Record<string, unknown>
}

export interface SearchPlacesDependencies {
  fetchFn: typeof fetch
  endpoint: string
  userAgent: string
  defaultLimit?: number
  defaultCountryCodes?: string[]
}
