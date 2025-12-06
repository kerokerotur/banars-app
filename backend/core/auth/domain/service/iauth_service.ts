/**
 * 認証サービスのインターフェース
 * Supabase Auth APIなどの外部認証サービスとの連携を抽象化
 */

export interface CreateAuthUserParams {
  email: string
  lineUserId: string
  displayName: string
  avatarUrl: string | null
}

export interface IAuthService {
  /**
   * 認証プロバイダーにユーザーを作成する
   * @returns 作成されたユーザーのID
   * @throws InitialSignupError ユーザー作成に失敗した場合
   */
  createUser(params: CreateAuthUserParams): Promise<string>

  /**
   * セッション転送用のトークンを発行する
   * @param email ユーザーのメールアドレス
   * @returns セッション転送トークン
   * @throws InitialSignupError トークン発行に失敗した場合
   */
  generateSessionToken(email: string): Promise<string>
}
