import { ValueObject } from "@core/shared/value_objects/value_object.ts"
import { InitialSignupError } from "../errors/initial_signup_error.ts"

/**
 * 招待トークンを表す値オブジェクト
 */
export class InviteToken extends ValueObject<string> {
  /**
   * @param value - 正規化されたトークン文字列
   */
  protected constructor(value: string) {
    super(value)
  }

  /**
   * 未検証のトークン文字列から招待トークンを生成する
   * @param token - 未検証のトークン文字列
   * @returns バリデーション済みの招待トークン
   * @throws {InitialSignupError} トークンが不正な場合
   */
  static fromRaw(token: string): InviteToken {
    const normalized = token?.trim()
    if (!normalized) {
      throw new InitialSignupError(
        "invalid_request",
        "招待トークンが指定されていません。",
        400,
      )
    }
    return new InviteToken(normalized)
  }

  /**
   * トークンをSHA-256でハッシュ化する
   * @returns ハッシュ化されたトークン（16進数文字列）
   */
  async hash(): Promise<string> {
    const encoded = new TextEncoder().encode(this.value)
    const digest = await crypto.subtle.digest("SHA-256", encoded)
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  }

  /**
   * 正規化されたトークン文字列を取得する
   */
  toString(): string {
    return this.value
  }
}
