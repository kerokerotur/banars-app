import { InitialSignupError } from "../errors/initial_signup_error.ts"

export interface LineTokensPayload {
  idToken: string
  accessToken: string
}

/**
 * LINE認証トークンを表すエンティティ
 */
export class LineTokens {
  private constructor(
    public readonly idToken: string,
    public readonly accessToken: string,
  ) {}

  /**
   * 未検証のペイロードからLINEトークンエンティティを生成する
   * @param payload - 未検証のペイロード
   * @returns バリデーション済みのLINEトークンエンティティ
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

    return new LineTokens(idToken, accessToken)
  }

  /**
   * 検証済みペイロードからLINEトークンエンティティを生成する
   * @param payload - 検証済みペイロード
   * @returns LINEトークンエンティティ
   */
  static fromPayload(payload: LineTokensPayload): LineTokens {
    return new LineTokens(payload.idToken, payload.accessToken)
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
