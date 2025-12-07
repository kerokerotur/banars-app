import { InviteIssueError } from "../errors/invite_issue_error.ts"

const DEFAULT_EXPIRES_IN_DAYS = 7
const MIN_EXPIRES_IN_DAYS = 1
const MAX_EXPIRES_IN_DAYS = 30

/**
 * 招待トークンの有効期限日数を表す値オブジェクト
 */
export class ExpiresInDays {
  private readonly value: number

  /**
   * 有効期限日数を生成する
   * @param value - 日数（1-30の範囲）。未指定の場合はデフォルト値（7日）
   * @throws {InviteIssueError} 値が範囲外または不正な場合
   */
  constructor(value?: number) {
    const days = value ?? DEFAULT_EXPIRES_IN_DAYS

    if (typeof days !== "number" || !Number.isInteger(days)) {
      throw new InviteIssueError(
        "invalid_request",
        "expiresInDays は整数で指定してください。",
        400,
      )
    }

    if (days < MIN_EXPIRES_IN_DAYS || days > MAX_EXPIRES_IN_DAYS) {
      throw new InviteIssueError(
        "invalid_request",
        `expiresInDays は ${MIN_EXPIRES_IN_DAYS}〜${MAX_EXPIRES_IN_DAYS} の範囲で指定してください。`,
        400,
      )
    }

    this.value = days
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
