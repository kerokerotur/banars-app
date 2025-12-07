import { describe, it, expect } from "vitest"
import { LineProfile } from "@core/auth/domain/entity/line_profile.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"

describe("LineProfile", () => {
  describe("fromRaw", () => {
    describe("正常系", () => {
      it("有効なペイロードからLineProfileを生成できる", () => {
        const profile = LineProfile.fromRaw({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "https://example.com/avatar.png",
        })

        expect(profile.lineUserId).toBe("U1234567890")
        expect(profile.displayName).toBe("テストユーザー")
        expect(profile.avatarUrl).toBe("https://example.com/avatar.png")
      })

      it("avatarUrlがnullの場合でも生成できる", () => {
        const profile = LineProfile.fromRaw({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: null,
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("avatarUrlが省略された場合、nullになる", () => {
        const profile = LineProfile.fromRaw({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
        })

        expect(profile.avatarUrl).toBeNull()
      })
    })

    describe("異常系", () => {
      it("nullを渡すとエラーになる", () => {
        expect(() => LineProfile.fromRaw(null)).toThrow(InitialSignupError)
        expect(() => LineProfile.fromRaw(null)).toThrow(
          "lineProfile はオブジェクトで指定してください。",
        )
      })

      it("配列を渡すとエラーになる", () => {
        expect(() => LineProfile.fromRaw([])).toThrow(InitialSignupError)
        expect(() => LineProfile.fromRaw([])).toThrow(
          "lineProfile はオブジェクトで指定してください。",
        )
      })

      it("文字列を渡すとエラーになる", () => {
        expect(() => LineProfile.fromRaw("string")).toThrow(InitialSignupError)
      })

      it("lineUserIdが欠落しているとエラーになる", () => {
        expect(() =>
          LineProfile.fromRaw({
            displayName: "テストユーザー",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineProfile.fromRaw({
            displayName: "テストユーザー",
          }),
        ).toThrow("lineProfile.lineUserId は文字列で指定してください。")
      })

      it("displayNameが欠落しているとエラーになる", () => {
        expect(() =>
          LineProfile.fromRaw({
            lineUserId: "U1234567890",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineProfile.fromRaw({
            lineUserId: "U1234567890",
          }),
        ).toThrow("lineProfile.displayName は文字列で指定してください。")
      })

      it("lineUserIdが空文字列だとエラーになる", () => {
        expect(() =>
          LineProfile.fromRaw({
            lineUserId: "",
            displayName: "テストユーザー",
          }),
        ).toThrow(InitialSignupError)
      })

      it("displayNameが空文字列だとエラーになる", () => {
        expect(() =>
          LineProfile.fromRaw({
            lineUserId: "U1234567890",
            displayName: "",
          }),
        ).toThrow(InitialSignupError)
      })
    })
  })

  describe("fromPayload", () => {
    describe("displayName の正規化", () => {
      it("前後の空白をトリムする", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "  テストユーザー  ",
        })

        expect(profile.displayName).toBe("テストユーザー")
      })

      it("120文字を超える場合は切り詰める", () => {
        const longName = "あ".repeat(150)
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: longName,
        })

        expect(profile.displayName).toBe("あ".repeat(120))
        expect(profile.displayName.length).toBe(120)
      })

      it("ちょうど120文字の場合は切り詰めない", () => {
        const exactName = "あ".repeat(120)
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: exactName,
        })

        expect(profile.displayName).toBe(exactName)
      })

      it("displayNameが空でfallbackNameがある場合はfallbackNameを使用する", () => {
        const profile = LineProfile.fromPayload(
          {
            lineUserId: "U1234567890",
            displayName: "",
          },
          "フォールバック名",
        )

        expect(profile.displayName).toBe("フォールバック名")
      })

      it("displayNameとfallbackName両方が空の場合はエラーになる", () => {
        expect(() =>
          LineProfile.fromPayload({
            lineUserId: "U1234567890",
            displayName: "",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineProfile.fromPayload({
            lineUserId: "U1234567890",
            displayName: "",
          }),
        ).toThrow("表示名を取得できませんでした。")
      })
    })

    describe("avatarUrl の正規化", () => {
      it("https URLはそのまま使用される", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "https://example.com/avatar.png",
        })

        expect(profile.avatarUrl).toBe("https://example.com/avatar.png")
      })

      it("http URLはそのまま使用される", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "http://example.com/avatar.png",
        })

        expect(profile.avatarUrl).toBe("http://example.com/avatar.png")
      })

      it("無効なプロトコルの場合はnullになる", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "ftp://example.com/avatar.png",
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("不正なURLの場合はnullになる", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "not-a-url",
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("空文字列の場合はnullになる", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "",
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("空白のみの場合はnullになる", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: "   ",
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("nullの場合はnullのまま", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: null,
        })

        expect(profile.avatarUrl).toBeNull()
      })

      it("undefinedの場合はnullになる", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "U1234567890",
          displayName: "テストユーザー",
          avatarUrl: undefined,
        })

        expect(profile.avatarUrl).toBeNull()
      })
    })

    describe("lineUserId の正規化", () => {
      it("前後の空白をトリムする", () => {
        const profile = LineProfile.fromPayload({
          lineUserId: "  U1234567890  ",
          displayName: "テストユーザー",
        })

        expect(profile.lineUserId).toBe("U1234567890")
      })

      it("空のlineUserIdはエラーになる", () => {
        expect(() =>
          LineProfile.fromPayload({
            lineUserId: "",
            displayName: "テストユーザー",
          }),
        ).toThrow(InitialSignupError)
        expect(() =>
          LineProfile.fromPayload({
            lineUserId: "",
            displayName: "テストユーザー",
          }),
        ).toThrow("lineProfile.lineUserId は必須です。")
      })

      it("空白のみのlineUserIdはエラーになる", () => {
        expect(() =>
          LineProfile.fromPayload({
            lineUserId: "   ",
            displayName: "テストユーザー",
          }),
        ).toThrow(InitialSignupError)
      })
    })
  })
})

