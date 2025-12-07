import { describe, it, expect } from "vitest"
import { ExpiresInDays } from "@core/auth/domain/value_objects/expires_in_days.ts"
import { InviteIssueError } from "@core/auth/domain/errors/invite_issue_error.ts"

describe("ExpiresInDays", () => {
  describe("constructor", () => {
    describe("正常系", () => {
      it("値を指定しない場合、デフォルト値（7）が設定される", () => {
        const expiresInDays = new ExpiresInDays()
        expect(expiresInDays.toNumber()).toBe(7)
      })

      it("最小値（1）を指定できる", () => {
        const expiresInDays = new ExpiresInDays(1)
        expect(expiresInDays.toNumber()).toBe(1)
      })

      it("最大値（30）を指定できる", () => {
        const expiresInDays = new ExpiresInDays(30)
        expect(expiresInDays.toNumber()).toBe(30)
      })

      it("範囲内の値（15）を指定できる", () => {
        const expiresInDays = new ExpiresInDays(15)
        expect(expiresInDays.toNumber()).toBe(15)
      })
    })

    describe("異常系", () => {
      it("0を指定するとエラーになる", () => {
        expect(() => new ExpiresInDays(0)).toThrow(InviteIssueError)
        expect(() => new ExpiresInDays(0)).toThrow(
          "expiresInDays は 1〜30 の範囲で指定してください。",
        )
      })

      it("31を指定するとエラーになる", () => {
        expect(() => new ExpiresInDays(31)).toThrow(InviteIssueError)
        expect(() => new ExpiresInDays(31)).toThrow(
          "expiresInDays は 1〜30 の範囲で指定してください。",
        )
      })

      it("負の値を指定するとエラーになる", () => {
        expect(() => new ExpiresInDays(-1)).toThrow(InviteIssueError)
        expect(() => new ExpiresInDays(-1)).toThrow(
          "expiresInDays は 1〜30 の範囲で指定してください。",
        )
      })

      it("小数を指定するとエラーになる", () => {
        expect(() => new ExpiresInDays(7.5)).toThrow(InviteIssueError)
        expect(() => new ExpiresInDays(7.5)).toThrow(
          "expiresInDays は整数で指定してください。",
        )
      })

      it("NaNを指定するとエラーになる", () => {
        expect(() => new ExpiresInDays(NaN)).toThrow(InviteIssueError)
        expect(() => new ExpiresInDays(NaN)).toThrow(
          "expiresInDays は整数で指定してください。",
        )
      })
    })
  })

  describe("calculateExpiresAt", () => {
    it("基準日から指定日数後の日付を返す", () => {
      const expiresInDays = new ExpiresInDays(7)
      const baseDate = new Date("2025-01-01T00:00:00Z")
      const expiresAt = expiresInDays.calculateExpiresAt(baseDate)

      expect(expiresAt.toISOString()).toBe("2025-01-08T00:00:00.000Z")
    })

    it("1日後を正しく計算できる", () => {
      const expiresInDays = new ExpiresInDays(1)
      const baseDate = new Date("2025-12-31T12:00:00Z")
      const expiresAt = expiresInDays.calculateExpiresAt(baseDate)

      expect(expiresAt.toISOString()).toBe("2026-01-01T12:00:00.000Z")
    })

    it("30日後を正しく計算できる", () => {
      const expiresInDays = new ExpiresInDays(30)
      const baseDate = new Date("2025-01-01T00:00:00Z")
      const expiresAt = expiresInDays.calculateExpiresAt(baseDate)

      expect(expiresAt.toISOString()).toBe("2025-01-31T00:00:00.000Z")
    })

    it("月またぎを正しく計算できる", () => {
      const expiresInDays = new ExpiresInDays(15)
      const baseDate = new Date("2025-01-25T00:00:00Z")
      const expiresAt = expiresInDays.calculateExpiresAt(baseDate)

      expect(expiresAt.toISOString()).toBe("2025-02-09T00:00:00.000Z")
    })

    it("基準日を指定しない場合、現在日時を基準にする", () => {
      const expiresInDays = new ExpiresInDays(7)
      const before = new Date()
      const expiresAt = expiresInDays.calculateExpiresAt()
      const after = new Date()

      // 7日後の範囲内であることを確認
      const expectedMin = new Date(before)
      expectedMin.setDate(expectedMin.getDate() + 7)
      const expectedMax = new Date(after)
      expectedMax.setDate(expectedMax.getDate() + 7)

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime())
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime())
    })
  })
})

