import type { IUserRepository } from "../../domain/irepository/user_repository.ts"
import type { IUserDetailRepository } from "../../domain/irepository/user_detail_repository.ts"
import type { UserInfo } from "../../domain/entity/user_info.ts"

export interface GetMeUseCaseRequest {
  userId: string
  userRole: string | null
}

export interface GetMeDependencies {
  userRepository: IUserRepository
  userDetailRepository: IUserDetailRepository
}

export type GetMeUseCaseResponse = UserInfo

