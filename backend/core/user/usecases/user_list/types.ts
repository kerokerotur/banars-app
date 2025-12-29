import type { IUserRepository } from "@core/auth/domain/irepository/user_repository.ts"
import type { UserListItem } from "../../domain/entity/user_list_item.ts"

export interface UserListUseCaseRequest {
  // 認証確認のみで、特別なパラメータは不要
}

export interface UserListDependencies {
  userRepository: IUserRepository
}

export type UserListUseCaseResponse = UserListItem[]
