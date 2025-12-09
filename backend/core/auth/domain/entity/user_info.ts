/**
 * ユーザ情報を表すエンティティ
 * user テーブル + user_detail テーブル + app_metadata.role を統合した情報
 */
export interface UserInfoPayload {
  userId: string
  lineUserId: string
  status: string
  lastLoginDatetime: Date | null
  displayName: string
  avatarUrl: string | null
  role: string | null
}

export class UserInfo {
  private constructor(
    public readonly userId: string,
    public readonly lineUserId: string,
    public readonly status: string,
    public readonly lastLoginDatetime: Date | null,
    public readonly displayName: string,
    public readonly avatarUrl: string | null,
    public readonly role: string | null,
  ) {}

  /**
   * 検証済みペイロードからUserInfoエンティティを生成する
   */
  static fromPayload(payload: UserInfoPayload): UserInfo {
    return new UserInfo(
      payload.userId,
      payload.lineUserId,
      payload.status,
      payload.lastLoginDatetime,
      payload.displayName,
      payload.avatarUrl,
      payload.role,
    )
  }

  /**
   * APIレスポンス用のJSON形式に変換する
   */
  toResponse(): {
    userId: string
    lineUserId: string
    status: string
    lastLoginDatetime: string | null
    displayName: string
    avatarUrl: string | null
    role: string | null
  } {
    return {
      userId: this.userId,
      lineUserId: this.lineUserId,
      status: this.status,
      lastLoginDatetime: this.lastLoginDatetime?.toISOString() ?? null,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      role: this.role,
    }
  }
}

