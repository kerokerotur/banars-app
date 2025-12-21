import { ValueObject } from "@core/shared/value_objects/value_object.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"

const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "_gl",
  "_ga",
  "_gid",
  "mc_cid",
  "mc_eid",
  "oly_anon_id",
  "oly_enc_id",
  "vero_conv",
  "vero_id",
])

/**
 * Google Maps 共有URLの正規化を担う値オブジェクト
 */
export class GoogleMapsUrlNormalized extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  /** 正規化済みURL文字列 */
  get rawValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  static create(rawUrl: string): GoogleMapsUrlNormalized {
    const trimmed = rawUrl.trim()

    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      throw new PlaceManagementError(
        "validation_error",
        "正しい Google Maps URL を入力してください",
        400,
      )
    }

    if (url.protocol !== "https:") {
      throw new PlaceManagementError(
        "validation_error",
        "HTTPSで始まる URL を入力してください",
        400,
      )
    }

    const host = url.host.toLowerCase()
    const isGoogleMapsHost =
      host.includes("maps.app.goo.gl") || host.includes("google.com")
    if (!isGoogleMapsHost) {
      throw new PlaceManagementError(
        "validation_error",
        "Google Maps の URL を入力してください",
        400,
      )
    }

    url.protocol = "https:"
    url.host = host
    url.hash = ""

    for (const key of Array.from(url.searchParams.keys())) {
      if (key.startsWith("utm_") || TRACKING_PARAMS.has(key)) {
        url.searchParams.delete(key)
      }
    }

    const compressedPath = url.pathname.replace(/\/+/g, "/")
    const trimmedPath =
      compressedPath.length > 1 && compressedPath.endsWith("/")
        ? compressedPath.slice(0, -1)
        : compressedPath
    url.pathname = trimmedPath

    return new GoogleMapsUrlNormalized(url.toString())
  }
}
