import { describe, it, expect, vi, beforeEach } from "vitest"
import { executeSearchPlacesUseCase } from "@core/events/usecases/search_places/usecase.ts"
import { PlaceSearchError } from "@core/events/domain/errors/place_search_error.ts"

const endpoint = "https://nominatim.openstreetmap.org/search"
const userAgent = "test-agent/1.0 (contact@example.com)"

describe("executeSearchPlacesUseCase", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
  })

  it("正常系: Nominatim のレスポンスを整形して返す", async () => {
    const nominatimResponse = [
      {
        place_id: 123,
        display_name: "東京ドーム, 文京区, 東京都, 日本",
        lat: "35.7056",
        lon: "139.7519",
        osm_id: 987,
        osm_type: "way",
        address: { stadium: "東京ドーム", city: "文京区" },
      },
    ]

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(nominatimResponse), { status: 200 }),
    )

    const results = await executeSearchPlacesUseCase(
      { query: "東京ドーム" },
      {
        fetchFn: fetchMock,
        endpoint,
        userAgent,
      },
    )

    expect(fetchMock).toHaveBeenCalledOnce()
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain("q=%E6%9D%B1%E4%BA%AC%E3%83%89%E3%83%BC%E3%83%A0")
    expect(calledUrl).toContain("format=jsonv2")
    expect(results).toEqual([
      {
        placeId: 123,
        displayName: "東京ドーム, 文京区, 東京都, 日本",
        lat: "35.7056",
        lon: "139.7519",
        osmId: 987,
        osmType: "way",
        address: { stadium: "東京ドーム", city: "文京区" },
      },
    ])
  })

  it("limit と countryCodes が指定された場合は URL に反映される", async () => {
    fetchMock.mockResolvedValue(new Response("[]", { status: 200 }))

    await executeSearchPlacesUseCase(
      { query: "東京", limit: 8, countryCodes: ["JP", "us"] },
      { fetchFn: fetchMock, endpoint, userAgent },
    )

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get("limit")).toBe("8")
    expect(calledUrl.searchParams.get("countrycodes")).toBe("jp,us")
  })

  it("空文字のクエリは validation_error を投げる", async () => {
    await expect(
      executeSearchPlacesUseCase(
        { query: "  " },
        { fetchFn: fetchMock, endpoint, userAgent },
      ),
    ).rejects.toThrow(PlaceSearchError)

    await expect(
      executeSearchPlacesUseCase(
        { query: "" },
        { fetchFn: fetchMock, endpoint, userAgent },
      ),
    ).rejects.toMatchObject({ code: "validation_error" })
  })

  it("429 の場合は rate_limited エラーを返す", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 429 }))

    await expect(
      executeSearchPlacesUseCase(
        { query: "東京ドーム" },
        { fetchFn: fetchMock, endpoint, userAgent },
      ),
    ).rejects.toMatchObject({ code: "rate_limited", status: 429 })
  })

  it("200 以外のレスポンスは upstream_error を返す", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }))

    await expect(
      executeSearchPlacesUseCase(
        { query: "東京ドーム" },
        { fetchFn: fetchMock, endpoint, userAgent },
      ),
    ).rejects.toMatchObject({ code: "upstream_error" })
  })

  it("JSON 以外のレスポンスは unexpected_response を返す", async () => {
    const brokenBody = "{"
    fetchMock.mockResolvedValue(
      new Response(brokenBody, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    await expect(
      executeSearchPlacesUseCase(
        { query: "東京ドーム" },
        { fetchFn: fetchMock, endpoint, userAgent },
      ),
    ).rejects.toMatchObject({ code: "unexpected_response" })
  })
})
