import { ValueObject } from "@core/shared/value_objects/value_object.ts"
import { InviteIssueError } from "../errors/invite_issue_error.ts"

const DEFAULT_EXPIRATION_PERIOD_DAYS = 7
const MIN_EXPIRATION_PERIOD_DAYS = 1
const MAX_EXPIRATION_PERIOD_DAYS = 30

/**
 * 招待トークンの有効期間日数を表す値オブジェクト
 */
export class ExpirationPeriodDays extends ValueObject<number> {
  /**
   * @param value - 検証済みの日数
   */
  protected constructor(value: number) {
    super(value)
  }

  /**
   * 未検証の値から有効期間日数を生成する
   * @param value - 日数（1-30の範囲）。未指定の場合はデフォルト値（7日）
   * @returns バリデーション済みの有効期間日数
   * @throws {InviteIssueError} 値が範囲外または不正な場合
   */
  static fromRaw(value?: number): ExpirationPeriodDays {
    const days = value ?? DEFAULT_EXPIRATION_PERIOD_DAYS

    if (typeof days !== "number" || !Number.isInteger(days)) {
      throw new InviteIssueError(
        "invalid_request",
        "expirationDays は整数で指定してください。",
        400,
      )
    }

    if (days < MIN_EXPIRATION_PERIOD_DAYS || days > MAX_EXPIRATION_PERIOD_DAYS) {
      throw new InviteIssueError(
        "invalid_request",
        `expirationDays は ${MIN_EXPIRATION_PERIOD_DAYS}〜${MAX_EXPIRATION_PERIOD_DAYS} の範囲で指定してください。`,
        400,
      )
    }

    return new ExpirationPeriodDays(days)
  }

  /**
   * 数値として取得する
   */
  toNumber(): number {
    return this.value
  }

  /**
   * 有効期限のDateオブジェクトを計算する
   * @param baseDate - 基準日（省略時は現在日時）
   * @returns 有効期限のDateオブジェクト
   */
  calculateExpiresAt(baseDate: Date = new Date()): Date {
    const expiresAt = new Date(baseDate)
    expiresAt.setDate(expiresAt.getDate() + this.value)
    return expiresAt
  }
}

