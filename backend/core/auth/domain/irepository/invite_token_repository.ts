/**
 * 招待トークンリポジトリのインターフェース
 */

export interface InviteToken {
  tokenHash: string
  expiresDatetime: Date
}

export interface InsertInviteTokenParams {
  tokenHash: string
  expiresDatetime: Date
  issuedBy: string
  createdUser: string
}

export interface IInviteTokenRepository {
  /**
   * 招待トークンを保存する
   */
  insert(params: InsertInviteTokenParams): Promise<void>

  /**
   * トークンハッシュで招待トークンを検索し、有効性を検証する
   * @throws InitialSignupError トークンが見つからない、期限切れ、検証エラーの場合
   */
  findByHashAndValidate(tokenHash: string): Promise<InviteToken>
}
