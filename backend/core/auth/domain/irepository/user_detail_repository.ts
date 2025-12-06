/**
 * ユーザー詳細リポジトリのインターフェース
 */

export interface UpsertUserDetailParams {
  userId: string
  displayName: string
  avatarUrl: string | null
  syncedDatetime: Date
}

export interface IUserDetailRepository {
  /**
   * ユーザー詳細を登録または更新する
   * @throws InitialSignupError 保存に失敗した場合
   */
  upsert(params: UpsertUserDetailParams): Promise<void>
}
