import { describe, it, expect } from "vitest"
import { LineTokens } from "@core/auth/domain/value_objects/line_tokens.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"

describe("LineTokens", () => {
  describe("fromRaw", () => {
    describe("正常系", () => {
      it("有効なペイロードからLineTokensを生成できる", () => {
        const tokens = LineTokens.fromRaw({
          idToken: "valid-id-token",
          accessToken: "valid-access-token",
        })

        expect(tokens.idToken).toBe("valid-id-token")
        expect(tokens.accessToken).toBe("valid-access-token")
      })

      it("トークンの前後の空白をトリムする", () => {
        const tokens = LineTokens.fromRaw({
          idToken: "  id-token  ",
          accessToken: "  access-token  ",
        })

        expect(tokens.idToken).toBe("id-token")
        expect(tokens.accessToken).toBe("access-token")
      })
    })

    describe("異常系", () => {
      it("nullを渡すとエラーになる", () => {
        expect(() => LineTokens.fromRaw(null)).toThrow(InitialSignupError)
        expect(() => LineTokens.fromRaw(null)).toThrow(
          "lineTokens はオブジェクトで指定してください。",
        )
      })

      it("undefinedを渡すとエラーになる", () => {
        expect(() => LineTokens.fromRaw(undefined)).toThrow(InitialSignupError)
        expect(() => LineTokens.fromRaw(undefined)).toThrow(
          "lineTokens はオブジェクトで指定してください。",
        )
      })

      it("配列を渡すとエラーになる", () => {
        expect(() => LineTokens.fromRaw([])).toThrow(InitialSignupError)
        expect(() => LineTokens.fromRaw([])).toThrow(
          "lineTokens はオブジェクトで指定してください。",
        )
      })

      it("文字列を渡すとエラーになる", () => {
        expect(() => LineTokens.fromRaw("string")).toThrow(InitialSignupError)
        expect(() => LineTokens.fromRaw("string")).toThrow(
          "lineTokens はオブジェクトで指定してください。",
        )
      })

      it("idTokenが欠落しているとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            accessToken: "valid-access-token",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineTokens.fromRaw({
            accessToken: "valid-access-token",
          }),
        ).toThrow("lineTokens.idToken は文字列で指定してください。")
      })

      it("accessTokenが欠落しているとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
          }),
        ).toThrow("lineTokens.accessToken は文字列で指定してください。")
      })

      it("idTokenが空文字列だとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "",
            accessToken: "valid-access-token",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineTokens.fromRaw({
            idToken: "",
            accessToken: "valid-access-token",
          }),
        ).toThrow("lineTokens.idToken は文字列で指定してください。")
      })

      it("accessTokenが空文字列だとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
            accessToken: "",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
            accessToken: "",
          }),
        ).toThrow("lineTokens.accessToken は文字列で指定してください。")
      })

      it("idTokenが空白のみだとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "   ",
            accessToken: "valid-access-token",
          }),
        ).toThrow(InitialSignupError)
      })

      it("accessTokenが空白のみだとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
            accessToken: "   ",
          }),
        ).toThrow(InitialSignupError)
      })

      it("idTokenが数値だとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: 12345,
            accessToken: "valid-access-token",
          }),
        ).toThrow(InitialSignupError)
      })

      it("accessTokenが数値だとエラーになる", () => {
        expect(() =>
          LineTokens.fromRaw({
            idToken: "valid-id-token",
            accessToken: 12345,
          }),
        ).toThrow(InitialSignupError)
      })
    })
  })

  describe("fromPayload", () => {
    it("検証済みペイロードからLineTokensを生成できる", () => {
      const tokens = LineTokens.fromPayload({
        idToken: "valid-id-token",
        accessToken: "valid-access-token",
      })

      expect(tokens.idToken).toBe("valid-id-token")
      expect(tokens.accessToken).toBe("valid-access-token")
    })

    it("トークンをそのまま保持する（トリムしない）", () => {
      const tokens = LineTokens.fromPayload({
        idToken: "  id-token  ",
        accessToken: "  access-token  ",
      })

      // fromPayloadは検証済みペイロードを受け取るため、トリムしない
      expect(tokens.idToken).toBe("  id-token  ")
      expect(tokens.accessToken).toBe("  access-token  ")
    })
  })
})

