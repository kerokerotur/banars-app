import { UserInfo } from "@core/auth/domain/entity/user_info.ts"
import { GetMeError } from "@core/auth/domain/errors/get_me_error.ts"
import type {
  GetMeDependencies,
  GetMeUseCaseRequest,
  GetMeUseCaseResponse,
} from "./types.ts"

export async function executeGetMeUseCase(
  request: GetMeUseCaseRequest,
  deps: GetMeDependencies,
): Promise<GetMeUseCaseResponse> {
  // ユーザー基本情報を取得
  const user = await deps.userRepository.findById(request.userId)
  if (!user) {
    throw new GetMeError(
      "user_not_found",
      "ユーザーが見つかりません。",
      404,
    )
  }

  // ユーザー詳細情報を取得
  const userDetail = await deps.userDetailRepository.findByUserId(request.userId)
  if (!userDetail) {
    throw new GetMeError(
      "user_not_found",
      "ユーザー詳細情報が見つかりません。",
      404,
    )
  }

  // UserInfo エンティティを生成して返却
  return UserInfo.fromPayload({
    userId: user.id,
    lineUserId: user.lineUserId,
    status: user.status,
    lastLoginDatetime: user.lastLoginDatetime,
    displayName: userDetail.displayName,
    avatarUrl: userDetail.avatarUrl,
    role: request.userRole,
  })
}

