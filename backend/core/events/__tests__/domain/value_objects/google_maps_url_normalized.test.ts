import { describe, it, expect } from "vitest"
import { GoogleMapsUrlNormalized } from "@core/events/domain/value_objects/google_maps_url_normalized.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"

describe("GoogleMapsUrlNormalized", () => {
  it("トラッキングパラメータとフラグメントを除去する", () => {
    const vo = GoogleMapsUrlNormalized.create(
      "https://www.google.com/maps/place/Tokyo/?utm_source=newsletter&fbclid=abc#section",
    )
    expect(vo.rawValue).toBe("https://www.google.com/maps/place/Tokyo")
  })

  it("短縮URLを保持しつつ末尾スラッシュを除去する", () => {
    const vo = GoogleMapsUrlNormalized.create("https://maps.app.goo.gl/AbCdE/")
    expect(vo.rawValue).toBe("https://maps.app.goo.gl/AbCdE")
  })

  it("非HTTPSや非Googleホストはvalidation_errorを投げる", () => {
    const cases = ["http://example.com/maps", "https://example.com/maps"]
    for (const url of cases) {
      expect(() => GoogleMapsUrlNormalized.create(url)).toThrow(
        PlaceManagementError,
      )
    }
  })

  it("連続スラッシュを圧縮する", () => {
    const vo = GoogleMapsUrlNormalized.create(
      "https://www.google.com/maps//place//Tokyo//",
    )
    expect(vo.rawValue).toBe("https://www.google.com/maps/place/Tokyo")
  })
})
