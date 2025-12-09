/**
 * ユーザーリポジトリのインターフェース
 */

export interface User {
  id: string
  lineUserId: string
  status: string
}

export interface UpsertUserParams {
  id: string
  lineUserId: string
  status: string
}

export interface UserWithLastLogin extends User {
  lastLoginDatetime: Date | null
}

export interface IUserRepository {
  /**
   * LINEユーザーIDでユーザーを検索する
   * @returns ユーザーが見つかった場合はユーザーオブジェクト、見つからない場合はnull
   */
  findByLineId(lineUserId: string): Promise<User | null>

  /**
   * ユーザーIDでユーザーを検索する（最終ログイン日時を含む）
   * @returns ユーザーが見つかった場合はユーザーオブジェクト、見つからない場合はnull
   */
  findById(userId: string): Promise<UserWithLastLogin | null>

  /**
   * ユーザーを登録または更新する
   * @throws InitialSignupError 登録に失敗した場合
   */
  upsert(params: UpsertUserParams): Promise<void>
}
