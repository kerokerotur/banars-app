import { describe, it, expect, vi, beforeEach } from "vitest"
import { verifyLineIdToken } from "@core/auth/domain/service/line_token_verifier.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"

// joseライブラリをモック
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mocked-jwks"),
  jwtVerify: vi.fn(),
}))

// モックをインポート
import { jwtVerify } from "jose"
const mockedJwtVerify = vi.mocked(jwtVerify)

describe("verifyLineIdToken", () => {
  const defaultOptions = {
    jwksUrl: "https://api.line.me/.well-known/jwks.json",
    audience: "test-channel-id",
    issuer: "https://access.line.me",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("正常系", () => {
    it("有効なトークンを検証してclaimsを返す", async () => {
      const mockPayload = {
        sub: "U1234567890",
        email: "test@example.com",
        name: "Test User",
        aud: "test-channel-id",
        iss: "https://access.line.me",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      mockedJwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: "RS256" },
      })

      const claims = await verifyLineIdToken("valid-token", defaultOptions)

      expect(claims.sub).toBe("U1234567890")
      expect(claims.email).toBe("test@example.com")
      expect(claims.name).toBe("Test User")
    })

    it("emailとnameがない場合でも検証成功する", async () => {
      const mockPayload = {
        sub: "U1234567890",
        aud: "test-channel-id",
        iss: "https://access.line.me",
      }

      mockedJwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: "RS256" },
      })

      const claims = await verifyLineIdToken("valid-token", defaultOptions)

      expect(claims.sub).toBe("U1234567890")
      expect(claims.email).toBeUndefined()
      expect(claims.name).toBeUndefined()
    })
  })

  describe("異常系", () => {
    it("空のトークンを渡すとエラーになる", async () => {
      await expect(verifyLineIdToken("", defaultOptions)).rejects.toThrow(
        InitialSignupError,
      )
      await expect(verifyLineIdToken("", defaultOptions)).rejects.toThrow(
        "LINE ID Token が空です。",
      )
    })

    it("subがないペイロードはエラーになる", async () => {
      const mockPayload = {
        email: "test@example.com",
        name: "Test User",
        aud: "test-channel-id",
        iss: "https://access.line.me",
      }

      mockedJwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: "RS256" },
      })

      try {
        await verifyLineIdToken("token-without-sub", defaultOptions)
        expect.fail("エラーが発生するべき")
      } catch (error) {
        expect(error).toBeInstanceOf(InitialSignupError)
        const signupError = error as InitialSignupError
        expect(signupError.message).toBe("LINE ID Token に sub が含まれていません。")
        expect(signupError.code).toBe("line_token_invalid")
        expect(signupError.status).toBe(400)
      }
    })

    it("JWT検証失敗時はエラーになる", async () => {
      mockedJwtVerify.mockRejectedValueOnce(new Error("signature verification failed"))

      await expect(
        verifyLineIdToken("invalid-token", defaultOptions),
      ).rejects.toThrow(InitialSignupError)
      await expect(
        verifyLineIdToken("invalid-token", defaultOptions),
      ).rejects.toThrow("LINE ID Token の検証に失敗しました。")
    })

    it("JWT検証失敗時のエラーには理由が含まれる", async () => {
      mockedJwtVerify.mockRejectedValueOnce(new Error("token expired"))

      try {
        await verifyLineIdToken("expired-token", defaultOptions)
        expect.fail("エラーが発生するべき")
      } catch (error) {
        expect(error).toBeInstanceOf(InitialSignupError)
        const signupError = error as InitialSignupError
        expect(signupError.code).toBe("line_token_invalid")
        expect(signupError.status).toBe(401)
        expect(signupError.details).toEqual({ reason: "token expired" })
      }
    })

    it("文字列以外のエラーも適切に処理される", async () => {
      mockedJwtVerify.mockRejectedValueOnce({ code: "ERR_JWS_INVALID" })

      try {
        await verifyLineIdToken("invalid-token", defaultOptions)
        expect.fail("エラーが発生するべき")
      } catch (error) {
        expect(error).toBeInstanceOf(InitialSignupError)
        const signupError = error as InitialSignupError
        expect(signupError.details?.reason).toBe("[object Object]")
      }
    })
  })

  describe("jwtVerify呼び出し", () => {
    it("正しいオプションでjwtVerifyが呼び出される", async () => {
      const mockPayload = {
        sub: "U1234567890",
      }

      mockedJwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: "RS256" },
      })

      await verifyLineIdToken("test-token", defaultOptions)

      expect(mockedJwtVerify).toHaveBeenCalledWith(
        "test-token",
        "mocked-jwks",
        {
          audience: "test-channel-id",
          issuer: "https://access.line.me",
        },
      )
    })
  })
})

