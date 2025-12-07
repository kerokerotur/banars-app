import { ValueObject } from "@core/shared/value_objects/value_object.ts"
import { InitialSignupError } from "../errors/initial_signup_error.ts"

export interface LineTokensPayload {
  idToken: string
  accessToken: string
}

/**
 * LINE認証トークンを表す値オブジェクト
 */
export class LineTokens extends ValueObject<LineTokensPayload> {
  /**
   * @param value - トークンペイロード
   */
  protected constructor(value: LineTokensPayload) {
    super(value)
  }

  /**
   * IDトークンを取得する
   */
  get idToken(): string {
    return this.value.idToken
  }

  /**
   * アクセストークンを取得する
   */
  get accessToken(): string {
    return this.value.accessToken
  }

  /**
   * 未検証のペイロードからLINEトークン値オブジェクトを生成する
   * @param payload - 未検証のペイロード
   * @returns バリデーション済みのLINEトークン値オブジェクト
   * @throws {InitialSignupError} ペイロードが不正な場合
   */
  static fromRaw(payload: unknown): LineTokens {
    if (!this.isRecord(payload)) {
      throw new InitialSignupError(
        "invalid_request",
        "lineTokens はオブジェクトで指定してください。",
        400,
      )
    }

    const idToken = this.validateToken(payload.idToken, "lineTokens.idToken")
    const accessToken = this.validateToken(
      payload.accessToken,
      "lineTokens.accessToken",
    )

    return new LineTokens({ idToken, accessToken })
  }

  /**
   * 検証済みペイロードからLINEトークン値オブジェクトを生成する
   * @param payload - 検証済みペイロード
   * @returns LINEトークン値オブジェクト
   */
  static fromPayload(payload: LineTokensPayload): LineTokens {
    return new LineTokens({ idToken: payload.idToken, accessToken: payload.accessToken })
  }

  private static validateToken(value: unknown, fieldName: string): string {
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
}
