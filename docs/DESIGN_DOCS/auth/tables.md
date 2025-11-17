# 認証コンテキストのテーブル定義

> すべてのテーブルは最後に `created_at` / `updated_at` を配置し、監査メタデータとして扱う。タイムスタンプは `timestamptz` かつ `UTC` 保管を前提とする。

## `users`
| カラム | 型 | 備考 |
| --- | --- | --- |
| `id` | `uuid` | PK, Supabase Auth の `auth.uid()` を使用 |
| `line_user_id` | `text` | LINE のユーザ識別子。ユニーク制約で多重登録を防ぐ |
| `last_login_at` | `timestamptz` | ログイン成功時に更新（任意） |
| `status` | `text` | `active` / `blocked` など。将来の退会管理用 |
| `created_at` | `timestamptz` | メタデータ: default `now()` |
| `updated_at` | `timestamptz` | メタデータ: Edge Function / ログイン処理で更新 |

**設計意図**: Supabase Auth ID と LINE ID のマッピングを保持し、LINE 以外の IDP 追加時も同テーブルで統合管理できるようにする。

## `user_details`
| カラム | 型 | 備考 |
| --- | --- | --- |
| `user_id` | `uuid` | PK, `users.id` への FK |
| `display_name` | `text` | LINE プロフィール名を保存。将来アプリ内編集に備えて nullable ではなく任意更新 |
| `avatar_url` | `text` | LINE の `picture_url` |
| `synced_at` | `timestamptz` | LINE から同期した日時 |
| `created_at` | `timestamptz` | メタデータ: default `now()` |
| `updated_at` | `timestamptz` | メタデータ: プロフィール再同期や手動編集時に更新 |

**設計意図**: UI 用プロフィール情報を `users` とは分離し、初回登録以外の更新にも対応しやすくする。

## `invite_tokens`
| カラム | 型 | 備考 |
| --- | --- | --- |
| `token_hash` | `text` | PK。ハッシュ比較で生トークンを保存しない |
| `team_id` | `uuid` | 参加先チーム（単一チーム固定。環境変数 `SINGLE_TEAM_ID` で設定する固定 UUID） |
| `expires_at` | `timestamptz` | 期限切れ判定 |
| `issued_by` | `uuid` | 発行した運営ユーザー |
| `created_at` | `timestamptz` | メタデータ: default `now()` |
| `updated_at` | `timestamptz` | メタデータ: 発行内容を変更した場合に更新 |

**設計意図**: 招待リンクは枠数制限を設けず、`expires_at` のみで有効性を管理する。`team_id` は現状固定だが、将来の複数チーム対応で可変化を想定。
