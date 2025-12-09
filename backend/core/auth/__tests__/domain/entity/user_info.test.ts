import { describe, it, expect } from "vitest"
import { UserInfo } from "@core/auth/domain/entity/user_info.ts"

describe("UserInfo", () => {
  describe("fromPayload", () => {
    it("有効なペイロードからUserInfoを生成できる", () => {
      const userInfo = UserInfo.fromPayload({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        lineUserId: "U1234567890",
        status: "active",
        lastLoginDatetime: new Date("2025-01-01T00:00:00Z"),
        displayName: "テストユーザー",
        avatarUrl: "https://example.com/avatar.png",
        role: "member",
      })

      expect(userInfo.userId).toBe("123e4567-e89b-12d3-a456-426614174000")
      expect(userInfo.lineUserId).toBe("U1234567890")
      expect(userInfo.status).toBe("active")
      expect(userInfo.lastLoginDatetime).toEqual(new Date("2025-01-01T00:00:00Z"))
      expect(userInfo.displayName).toBe("テストユーザー")
      expect(userInfo.avatarUrl).toBe("https://example.com/avatar.png")
      expect(userInfo.role).toBe("member")
    })

    it("nullの値を含むペイロードからも生成できる", () => {
      const userInfo = UserInfo.fromPayload({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        lineUserId: "U1234567890",
        status: "active",
        lastLoginDatetime: null,
        displayName: "テストユーザー",
        avatarUrl: null,
        role: null,
      })

      expect(userInfo.lastLoginDatetime).toBeNull()
      expect(userInfo.avatarUrl).toBeNull()
      expect(userInfo.role).toBeNull()
    })
  })

  describe("toResponse", () => {
    it("APIレスポンス用のオブジェクトを返す", () => {
      const userInfo = UserInfo.fromPayload({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        lineUserId: "U1234567890",
        status: "active",
        lastLoginDatetime: new Date("2025-01-01T00:00:00Z"),
        displayName: "テストユーザー",
        avatarUrl: "https://example.com/avatar.png",
        role: "manager",
      })

      const response = userInfo.toResponse()

      expect(response).toEqual({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        lineUserId: "U1234567890",
        status: "active",
        lastLoginDatetime: "2025-01-01T00:00:00.000Z",
        displayName: "テストユーザー",
        avatarUrl: "https://example.com/avatar.png",
        role: "manager",
      })
    })

    it("lastLoginDatetimeがnullの場合はnullを返す", () => {
      const userInfo = UserInfo.fromPayload({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        lineUserId: "U1234567890",
        status: "active",
        lastLoginDatetime: null,
        displayName: "テストユーザー",
        avatarUrl: null,
        role: null,
      })

      const response = userInfo.toResponse()

      expect(response.lastLoginDatetime).toBeNull()
      expect(response.avatarUrl).toBeNull()
      expect(response.role).toBeNull()
    })
  })
})

