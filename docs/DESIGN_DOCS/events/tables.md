# イベントコンテキストのテーブル定義

## `event_types`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | イベント種別 ID | PK。`gen_random_uuid()` |
| `name` | `text` | ○ | 種別名 | 例: 試合、練習、その他 |
| `display_order` | `integer` | ○ | 表示順 | 昇順で並び替え |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` 参照 |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` 参照 |

**設計意図**
- イベント種別を enum ではなくテーブルで管理し、運営が気軽に追加・編集できるようにする。
- `display_order` で選択肢の並び順を制御。

**初期データ**
- 試合（display_order: 1）
- 練習（display_order: 2）
- その他（display_order: 3）

**インデックス / 制約**
- `CREATE INDEX event_types_display_order_idx ON event_types (display_order);`

## `events`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | イベント ID | PK。`gen_random_uuid()` |
| `title` | `text` | ○ | イベントタイトル | 最長 120 文字想定 |
| `event_type_id` | `uuid` | ○ | イベント種別 ID | `event_types.id` 参照 |
| `start_datetime` | `timestamptz` |  | 開始日時 | - |
| `meeting_datetime` | `timestamptz` |  | 集合（meeting）日時 | - |
| `response_deadline_datetime` | `timestamptz` |  | 参加回答の締切 | リマインド対象抽出用 |
| `notes_markdown` | `text` |  | メモ/持ち物 | Markdown で保存 |
| `event_place_id` | `uuid` |  | 会場参照 | `event_places.id` 参照 |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` 参照（主に運営） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` 参照。更新時に上書き |

**設計意図**
- ステータス列や論理削除は要件から除外し、物理削除で管理する。
- `event_place_id` で `event_places` テーブルを参照し、場所情報を取得する。イベント表示時は `event_places` を JOIN して場所情報を表示。
- `response_deadline_datetime` を時刻情報まで保持し、リマインド通知のトリガーに使う（締切経過後も出欠操作は制限しない）。
- `event_type_id` で種別テーブルを参照し、種別の追加・変更を柔軟に行えるようにする。

**インデックス / 制約**
- `CREATE INDEX events_start_datetime_idx ON events (start_datetime DESC);` — 最新イベント一覧向け。
- `CREATE INDEX events_response_deadline_idx ON events (response_deadline_datetime);` — リマインドジョブ抽出用。

## `event_places`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | 会場レコード ID | PK。`gen_random_uuid()` |
| `name` | `text` | ○ | 会場名 | - |
| `google_maps_url_normalized` | `text` | ○ | 正規化済み Google Maps 共有 URL | 重複防止用に正規化した値を保存 |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` 参照（記録者） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` 参照 |

**設計意図**

- 場所は事前に管理者・運営が登録し、イベント作成時は登録済みの場所から選択する方式を採用。
- Google Maps の共有 URL はサーバー側で正規化し、正規化済みの値のみを保存・比較する。表示用途では正規化済み URL を返す。
- 場所名による重複を防ぐため、UI レベルで同名チェックを行う（または UNIQUE 制約を設定）。

**インデックス / 制約**

- `CREATE UNIQUE INDEX event_places_name_idx ON event_places (name);` — 場所名の重複を防ぐ。
- `CREATE UNIQUE INDEX event_places_google_maps_url_norm_idx ON event_places (google_maps_url_normalized);` — Google Maps URL の重複を防ぐ。

## RLS / 権限メモ

event コンテキストのテーブル（`event_types`, `events`, `event_places`）は RLS を設定せず、チームメンバー全員が自由に操作できるようにする。

## 未決定事項 / Follow-up

- Google Maps 共有 URL のバリデーション方法（URL フォーマットチェック等）。
- 場所の編集・削除権限の制御方針（既存イベントで使用中の場所の削除可否等）。
