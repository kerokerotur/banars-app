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

## `user_list_view`（View テーブル）
| カラム | 型 | 必須 | 説明 | 備考 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | ユーザー ID | `user.id` |
| `line_user_id` | `text` | ○ | LINE ユーザ ID | `user.line_user_id` |
| `status` | `text` | ○ | アカウント状態 | `user.status` |
| `last_login_datetime` | `timestamptz` |  | 最終ログイン日時 | `user.last_login_datetime` |
| `created_at` | `timestamptz` | ○ | ユーザー作成日時 | `user.created_at` |
| `display_name` | `text` | ○ | 表示名 | `user_detail.display_name` |
| `avatar_url` | `text` |  | プロフィール画像 URL | `user_detail.avatar_url` |

**設計意図**: `user` と `user_detail` を INNER JOIN した結果を提供する。本アプリでは外部キー制約を設定しない方針のため、supabase-js で複数テーブルを JOIN して取得することができない。そのため、View テーブルを使用して DB 側で JOIN した結果をアプリ側で取得する。フィルタリング（`status='active'`）やソート（`ORDER BY created_at`）は View 定義には含めず、アプリ側（supabase-js の `.eq()` / `.order()`）で行う。

## `onesignal_players`

| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | OneSignal Player IDレコード ID | PK。`gen_random_uuid()` |
| `user_id` | `uuid` | ○ | ユーザー ID | `user.id` 参照 |
| `player_id` | `text` | ○ | OneSignal Player ID | - |
| `is_active` | `boolean` | ○ | 有効フラグ | `DEFAULT true`。無効なPlayer IDは `false` に更新 |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `user.id` 参照 |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `user.id` 参照 |

**設計意図**
- OneSignal を使用したバックグラウンド通知を送信するために、各ユーザーのOneSignal Player IDを管理する。
- OneSignal側で端末token（device_token）の管理は自動的に行われるが、ユーザーIDとPlayer IDの紐付けが必要なため、このテーブルで管理する。
- 1ユーザーが複数端末（iPhone + iPad、複数のスマートフォンなど）を持っている場合に対応するため、`(user_id, player_id)` のユニーク制約を設定。
- OneSignal API から無効な Player ID が返された場合、`is_active = false` に更新し、次回のアプリ起動時に新しい Player ID を取得して再登録を促す。
- FK 制約は設定せず、アプリケーション層で参照整合性を担保（プロジェクトポリシーに準拠）。

**インデックス / 制約**
- `UNIQUE (user_id, player_id)` — 1ユーザー・1端末につき 1 レコードのみ。UPSERT 実現のキー。
- `CREATE INDEX onesignal_players_user_id_idx ON onesignal_players (user_id) WHERE is_active = true;` — 有効なPlayer ID取得用。
- `CREATE INDEX onesignal_players_is_active_idx ON onesignal_players (is_active);` — 無効なPlayer IDの一括更新用。
