import { UserListItem } from "@core/user/domain/entity/user_list_item.ts"
import type {
  UserListDependencies,
  UserListUseCaseRequest,
  UserListUseCaseResponse,
} from "./types.ts"

export async function executeUserListUseCase(
  _request: UserListUseCaseRequest,
  deps: UserListDependencies,
): Promise<UserListUseCaseResponse> {
  // アクティブなユーザー一覧を取得（user_detail + role をJOIN済み）
  const users = await deps.userRepository.findAllActive()

  // UserListItemエンティティの配列を生成して返却
  return users.map((user) =>
    UserListItem.fromPayload({
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      lastLoginDatetime: user.lastLoginDatetime,
      role: user.role,
      createdAt: user.createdAt,
    }),
  )
}
