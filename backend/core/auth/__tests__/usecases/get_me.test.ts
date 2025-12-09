import { describe, it, expect, vi, beforeEach } from "vitest"
import { executeGetMeUseCase } from "@core/auth/usecases/get_me/usecase.ts"
import { GetMeError } from "@core/auth/domain/errors/get_me_error.ts"
import type { IUserRepository, UserWithLastLogin } from "@core/auth/domain/irepository/user_repository.ts"
import type { IUserDetailRepository, UserDetail } from "@core/auth/domain/irepository/user_detail_repository.ts"

describe("executeGetMeUseCase", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000"
  const mockUserRole = "member"

  const mockUser: UserWithLastLogin = {
    id: mockUserId,
    lineUserId: "U1234567890",
    status: "active",
    lastLoginDatetime: new Date("2025-01-01T00:00:00Z"),
  }

  const mockUserDetail: UserDetail = {
    userId: mockUserId,
    displayName: "テストユーザー",
    avatarUrl: "https://example.com/avatar.png",
  }

  let mockUserRepository: IUserRepository
  let mockUserDetailRepository: IUserDetailRepository

  beforeEach(() => {
    mockUserRepository = {
      findByLineId: vi.fn(),
      findById: vi.fn(),
      upsert: vi.fn(),
    }
    mockUserDetailRepository = {
      findByUserId: vi.fn(),
      upsert: vi.fn(),
    }
  })

  describe("正常系", () => {
    it("ユーザー情報を正常に取得できる", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserDetailRepository.findByUserId).mockResolvedValue(mockUserDetail)

      const result = await executeGetMeUseCase(
        { userId: mockUserId, userRole: mockUserRole },
        { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
      )

      expect(result.userId).toBe(mockUserId)
      expect(result.lineUserId).toBe("U1234567890")
      expect(result.status).toBe("active")
      expect(result.lastLoginDatetime).toEqual(new Date("2025-01-01T00:00:00Z"))
      expect(result.displayName).toBe("テストユーザー")
      expect(result.avatarUrl).toBe("https://example.com/avatar.png")
      expect(result.role).toBe("member")
    })

    it("ロールがnullでも取得できる", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserDetailRepository.findByUserId).mockResolvedValue(mockUserDetail)

      const result = await executeGetMeUseCase(
        { userId: mockUserId, userRole: null },
        { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
      )

      expect(result.role).toBeNull()
    })

    it("lastLoginDatetimeがnullでも取得できる", async () => {
      const userWithoutLastLogin: UserWithLastLogin = {
        ...mockUser,
        lastLoginDatetime: null,
      }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(userWithoutLastLogin)
      vi.mocked(mockUserDetailRepository.findByUserId).mockResolvedValue(mockUserDetail)

      const result = await executeGetMeUseCase(
        { userId: mockUserId, userRole: mockUserRole },
        { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
      )

      expect(result.lastLoginDatetime).toBeNull()
    })

    it("avatarUrlがnullでも取得できる", async () => {
      const userDetailWithoutAvatar: UserDetail = {
        ...mockUserDetail,
        avatarUrl: null,
      }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserDetailRepository.findByUserId).mockResolvedValue(userDetailWithoutAvatar)

      const result = await executeGetMeUseCase(
        { userId: mockUserId, userRole: mockUserRole },
        { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
      )

      expect(result.avatarUrl).toBeNull()
    })
  })

  describe("異常系", () => {
    it("ユーザーが見つからない場合はエラーを投げる", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(
        executeGetMeUseCase(
          { userId: mockUserId, userRole: mockUserRole },
          { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
        ),
      ).rejects.toThrow(GetMeError)

      await expect(
        executeGetMeUseCase(
          { userId: mockUserId, userRole: mockUserRole },
          { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
        ),
      ).rejects.toThrow("ユーザーが見つかりません。")
    })

    it("ユーザー詳細が見つからない場合はエラーを投げる", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserDetailRepository.findByUserId).mockResolvedValue(null)

      await expect(
        executeGetMeUseCase(
          { userId: mockUserId, userRole: mockUserRole },
          { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
        ),
      ).rejects.toThrow(GetMeError)

      await expect(
        executeGetMeUseCase(
          { userId: mockUserId, userRole: mockUserRole },
          { userRepository: mockUserRepository, userDetailRepository: mockUserDetailRepository },
        ),
      ).rejects.toThrow("ユーザー詳細情報が見つかりません。")
    })
  })
})

