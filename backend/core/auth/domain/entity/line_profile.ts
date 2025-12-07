import { InitialSignupError } from "../errors/initial_signup_error.ts"

export interface LineProfilePayload {
  lineUserId: string
  displayName: string
  avatarUrl?: string | null
}

/**
 * LINEプロフィールを表すエンティティ
 */
export class LineProfile {
  private constructor(
    public readonly lineUserId: string,
    public readonly displayName: string,
    public readonly avatarUrl: string | null,
  ) {}

  /**
   * 未検証のペイロードからLINEプロフィールエンティティを生成する
   * @param rawPayload - 未検証のペイロード
   * @param fallbackName - 表示名が取得できない場合のフォールバック
   * @returns バリデーション済みのLINEプロフィールエンティティ
   * @throws {InitialSignupError} ペイロードが不正な場合
   */
  static fromRaw(
    rawPayload: unknown,
    fallbackName?: string | null,
  ): LineProfile {
    if (!this.isRecord(rawPayload)) {
      throw new InitialSignupError(
        "invalid_request",
        "lineProfile はオブジェクトで指定してください。",
        400,
      )
    }

    const lineUserId = this.validateStringField(
      rawPayload.lineUserId,
      "lineProfile.lineUserId",
    )
    const displayName = this.validateStringField(
      rawPayload.displayName,
      "lineProfile.displayName",
    )
    const avatarUrl =
      typeof rawPayload.avatarUrl === "string" ? rawPayload.avatarUrl : null

    return this.fromPayload(
      { lineUserId, displayName, avatarUrl },
      fallbackName,
    )
  }

  /**
   * 検証済みペイロードからLINEプロフィールエンティティを生成する
   * @param payload - 検証済みペイロード
   * @param fallbackName - 表示名が取得できない場合のフォールバック
   * @returns 正規化されたLINEプロフィールエンティティ
   */
  static fromPayload(
    payload: LineProfilePayload,
    fallbackName?: string | null,
  ): LineProfile {
    const displayNameSource =
      payload.displayName?.trim() || fallbackName?.trim() || ""

    return new LineProfile(
      this.normalizeLineUserId(payload.lineUserId),
      this.normalizeDisplayName(displayNameSource),
      this.normalizeAvatarUrl(payload.avatarUrl),
    )
  }

  private static validateStringField(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new InitialSignupError(
        "invalid_request",
        `${fieldName} は文字列で指定してください。`,
        400,
      )
    }
    return value.trim()
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
  }

  private static normalizeDisplayName(value: string): string {
    const trimmed = value?.trim()
    if (!trimmed) {
      throw new InitialSignupError(
        "invalid_request",
        "表示名を取得できませんでした。",
        400,
      )
    }
    return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed
  }

  private static normalizeAvatarUrl(
    value: string | null | undefined,
  ): string | null {
    if (!value) {
      return null
    }
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }
    try {
      const url = new URL(trimmed)
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return null
      }
      return url.toString()
    } catch (_) {
      return null
    }
  }

  private static normalizeLineUserId(value: string): string {
    const trimmed = value?.trim()
    if (!trimmed) {
      throw new InitialSignupError(
        "invalid_request",
        "lineProfile.lineUserId は必須です。",
        400,
      )
    }
    return trimmed
  }
}
