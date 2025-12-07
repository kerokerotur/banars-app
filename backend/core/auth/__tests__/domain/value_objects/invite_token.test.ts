import { describe, it, expect } from "vitest"
import { InviteToken } from "@core/auth/domain/value_objects/invite_token.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"

describe("InviteToken", () => {
  describe("fromRaw", () => {
    describe("正常系", () => {
      it("通常の文字列からトークンを生成できる", () => {
        const token = InviteToken.fromRaw("abc123")
        expect(token.toString()).toBe("abc123")
      })

      it("前後の空白をトリムして生成できる", () => {
        const token = InviteToken.fromRaw("  abc123  ")
        expect(token.toString()).toBe("abc123")
      })

      it("長い文字列からもトークンを生成できる", () => {
        const longToken = "a".repeat(100)
        const token = InviteToken.fromRaw(longToken)
        expect(token.toString()).toBe(longToken)
      })
    })

    describe("異常系", () => {
      it("空文字列を渡すとエラーになる", () => {
        expect(() => InviteToken.fromRaw("")).toThrow(InitialSignupError)
        expect(() => InviteToken.fromRaw("")).toThrow(
          "招待トークンが指定されていません。",
        )
      })

      it("空白のみの文字列を渡すとエラーになる", () => {
        expect(() => InviteToken.fromRaw("   ")).toThrow(InitialSignupError)
        expect(() => InviteToken.fromRaw("   ")).toThrow(
          "招待トークンが指定されていません。",
        )
      })

      it("nullish値を渡すとエラーになる", () => {
        // @ts-expect-error: テストのため型エラーを無視
        expect(() => InviteToken.fromRaw(null)).toThrow(InitialSignupError)
        // @ts-expect-error: テストのため型エラーを無視
        expect(() => InviteToken.fromRaw(undefined)).toThrow(InitialSignupError)
      })
    })
  })

  describe("hash", () => {
    it("SHA-256ハッシュを16進数文字列で返す", async () => {
      const token = InviteToken.fromRaw("test-token")
      const hash = await token.hash()

      // SHA-256ハッシュは64文字の16進数文字列
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it("同じトークンは同じハッシュを返す", async () => {
      const token1 = InviteToken.fromRaw("same-token")
      const token2 = InviteToken.fromRaw("same-token")

      const hash1 = await token1.hash()
      const hash2 = await token2.hash()

      expect(hash1).toBe(hash2)
    })

    it("異なるトークンは異なるハッシュを返す", async () => {
      const token1 = InviteToken.fromRaw("token-1")
      const token2 = InviteToken.fromRaw("token-2")

      const hash1 = await token1.hash()
      const hash2 = await token2.hash()

      expect(hash1).not.toBe(hash2)
    })

    it("既知の入力に対して期待されるハッシュを返す", async () => {
      // "hello" の SHA-256 ハッシュ
      const token = InviteToken.fromRaw("hello")
      const hash = await token.hash()

      expect(hash).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      )
    })
  })

  describe("toString", () => {
    it("正規化されたトークン文字列を返す", () => {
      const token = InviteToken.fromRaw("  my-token  ")
      expect(token.toString()).toBe("my-token")
    })
  })
})

