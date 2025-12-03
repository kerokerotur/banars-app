# 認証コンテキストのテーブル定義

> すべてのテーブルは最後に `created_at` / `created_user` / `updated_at` / `updated_user` を配置し、監査メタデータとして扱う。タイムスタンプは `timestamptz` かつ `UTC` 保管を前提とする。

## `user`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | Supabase Auth の UID | PK。|
| `line_user_id` | `text` | ○ | LINE ユーザ ID | `UNIQUE(line_user_id)` |
| `last_login_datetime` | `timestamptz` |  | 最終ログイン日時 | - |
| `status` | `text` | ○ | アカウント状態 | `active/blocked` 等。必要に応じて ENUM 化 |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `user.id` FK（管理者操作時のみ記録） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `user.id` FK |

**設計意図**: Supabase Auth ID と LINE ID のマッピングを保持し、LINE 以外の IDP 追加時も単一テーブルで統合管理できるようにする。

## `user_detail`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `user_id` | `uuid` | ○ | `user` との 1:1 キー | PK 兼 FK（`user.id`） |
| `display_name` | `text` | ○ | 表示名 | - |
| `avatar_url` | `text` |  | プロフィール画像 URL | - |
| `synced_datetime` | `timestamptz` |  | LINE 情報の同期日時 | - |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `user.id` FK |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `updated_user` | `uuid` |  | メタデータ | `user.id` FK |

**設計意図**: UI 用プロフィール情報を `user` とは分離し、初回登録以外の更新にも対応しやすくする。

## `invite_token`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `token_hash` | `text` | ○ | 招待トークンのハッシュ | PK。生トークンは保存しない |
| `expires_datetime` | `timestamptz` | ○ | 有効期限 | - |
| `issued_by` | `uuid` | ○ | 発行者 | `user.id` FK |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `user.id` FK |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `updated_user` | `uuid` |  | メタデータ | `user.id` FK |

**設計意図**: 招待リンクは枠数制限を設けず、`expires_datetime` のみで有効性を管理する。チーム概念は扱わず単一コミュニティ運用を前提とする。
