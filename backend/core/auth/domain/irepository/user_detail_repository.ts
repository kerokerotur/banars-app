/**
 * ユーザー詳細リポジトリのインターフェース
 */

export interface UserDetail {
  userId: string
  displayName: string
  avatarUrl: string | null
}

export interface UpsertUserDetailParams {
  userId: string
  displayName: string
  avatarUrl: string | null
  syncedDatetime: Date
}

export interface IUserDetailRepository {
  /**
   * ユーザーIDでユーザー詳細を検索する
   * @returns ユーザー詳細が見つかった場合はオブジェクト、見つからない場合はnull
   */
  findByUserId(userId: string): Promise<UserDetail | null>

  /**
   * ユーザー詳細を登録または更新する
   * @throws InitialSignupError 保存に失敗した場合
   */
  upsert(params: UpsertUserDetailParams): Promise<void>
}
