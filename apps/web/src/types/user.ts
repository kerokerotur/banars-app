/**
 * ユーザー関連の型定義
 */

/**
 * ログインユーザーのプロフィール（get_me API レスポンス準拠）
 */
export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string | null;
}

/**
 * ユーザー情報
 */
export interface UserInfo {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: "manager" | "member";
  emailAddress: string | null;
}

/**
 * ユーザー一覧のアイテム
 */
export interface UserListItem {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "manager" | "member";
}
