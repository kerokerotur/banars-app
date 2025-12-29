/**
 * ユーザー一覧の各アイテムを表すエンティティ
 */
export interface UserListItemPayload {
  userId: string
  displayName: string
  avatarUrl: string | null
  status: string
  lastLoginDatetime: Date | null
  role: string | null
  createdAt: Date
}

export class UserListItem {
  private constructor(
    public readonly userId: string,
    public readonly displayName: string,
    public readonly avatarUrl: string | null,
    public readonly status: string,
    public readonly lastLoginDatetime: Date | null,
    public readonly role: string | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * ペイロードからUserListItemエンティティを生成する
   */
  static fromPayload(payload: UserListItemPayload): UserListItem {
    return new UserListItem(
      payload.userId,
      payload.displayName,
      payload.avatarUrl,
      payload.status,
      payload.lastLoginDatetime,
      payload.role,
      payload.createdAt,
    )
  }

  /**
   * APIレスポンス用のJSON形式に変換する
   */
  toResponse(): {
    userId: string
    displayName: string
    avatarUrl: string | null
    status: string
    lastLoginDatetime: string | null
    role: string | null
    createdAt: string
  } {
    return {
      userId: this.userId,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      status: this.status,
      lastLoginDatetime: this.lastLoginDatetime?.toISOString() ?? null,
      role: this.role,
      createdAt: this.createdAt.toISOString(),
    }
  }
}
