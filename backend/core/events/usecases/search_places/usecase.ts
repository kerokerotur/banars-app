import { z } from "zod"
import { PlaceSearchError } from "@core/events/domain/errors/place_search_error.ts"
import type {
  SearchPlaceResult,
  SearchPlacesDependencies,
  SearchPlacesUseCaseRequest,
} from "./types.ts"

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const DEFAULT_COUNTRY_CODES = ["jp"]

const nominatimResultSchema = z.object({
  place_id: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseInt(value, 10) : value),
    z.number(),
  ),
  display_name: z.string(),
  lat: z.preprocess(
    (value) => (typeof value === "number" ? value.toString() : value),
    z.string(),
  ),
  lon: z.preprocess(
    (value) => (typeof value === "number" ? value.toString() : value),
    z.string(),
  ),
  osm_id: z
    .preprocess(
      (value) =>
        typeof value === "string" ? Number.parseInt(value, 10) : value ?? null,
      z.number().optional(),
    )
    .optional(),
  osm_type: z.string().optional(),
  address: z.record(z.unknown()).optional(),
})

const nominatimResponseSchema = z.array(nominatimResultSchema)

function buildSearchUrl(
  endpoint: string,
  query: string,
  limit: number,
  countryCodes: string[],
): string {
  const url = new URL(endpoint)
  url.searchParams.set("q", query)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", String(limit))
  if (countryCodes.length > 0) {
    url.searchParams.set("countrycodes", countryCodes.join(","))
  }
  return url.toString()
}

function normalizeLimit(
  limit: number | undefined,
  defaultLimit?: number,
): number {
  const base = limit ?? defaultLimit ?? DEFAULT_LIMIT
  const clamped = Math.max(1, Math.min(base, MAX_LIMIT))
  return Number.isNaN(clamped) ? DEFAULT_LIMIT : clamped
}

function normalizeCountryCodes(
  codes: string[] | undefined,
  fallback?: string[],
): string[] {
  const source = codes?.length ? codes : fallback ?? DEFAULT_COUNTRY_CODES
  return source
    .map((code) => code.trim().toLowerCase())
    .filter((code) => /^[a-z]{2}$/i.test(code))
    .slice(0, 5)
}

export async function executeSearchPlacesUseCase(
  request: SearchPlacesUseCaseRequest,
  deps: SearchPlacesDependencies,
): Promise<SearchPlaceResult[]> {
  const trimmedQuery = request.query.trim()
  if (!trimmedQuery) {
    throw new PlaceSearchError(
      "validation_error",
      "検索キーワードを入力してください。",
      400,
    )
  }

  const limit = normalizeLimit(request.limit, deps.defaultLimit)
  const countryCodes = normalizeCountryCodes(
    request.countryCodes,
    deps.defaultCountryCodes,
  )

  const url = buildSearchUrl(deps.endpoint, trimmedQuery, limit, countryCodes)

  let response: Response
  try {
    response = await deps.fetchFn(url, {
      headers: {
        "User-Agent": deps.userAgent,
        "Accept-Language": "ja",
        Accept: "application/json",
      },
    })
  } catch (error) {
    throw new PlaceSearchError(
      "upstream_error",
      "Nominatim へのリクエストに失敗しました。",
      502,
      error instanceof Error ? { message: error.message } : undefined,
    )
  }

  if (response.status === 429) {
    throw new PlaceSearchError(
      "rate_limited",
      "Nominatim のレート制限に達しました。しばらく時間をおいて再試行してください。",
      429,
    )
  }

  if (!response.ok) {
    throw new PlaceSearchError(
      "upstream_error",
      `Nominatim からエラー応答が返されました (status: ${response.status}).`,
      502,
      { status: response.status },
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch (error) {
    throw new PlaceSearchError(
      "unexpected_response",
      "Nominatim のレスポンスを JSON として解釈できませんでした。",
      502,
      error instanceof Error ? { message: error.message } : undefined,
    )
  }

  const parsed = nominatimResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new PlaceSearchError(
      "unexpected_response",
      "Nominatim のレスポンス形式が想定と異なります。",
      502,
      { issues: parsed.error.format() },
    )
  }

  return parsed.data.map<SearchPlaceResult>((item) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    lat: item.lat,
    lon: item.lon,
    osmId: item.osm_id ?? null,
    osmType: item.osm_type ?? null,
    address: item.address ?? {},
  }))
}
