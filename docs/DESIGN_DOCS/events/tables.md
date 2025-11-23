# イベントコンテキストのテーブル定義

## `events`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | イベント ID | PK。`gen_random_uuid()` |
| `title` | `text` | ○ | イベントタイトル | 最長 120 文字想定 |
| `event_type` | `text` | ○ | イベント種別 | 自由文字列（`game/practice/other` から開始） |
| `start_datetime` | `timestamptz` | ○ | 開始日時 | - |
| `meeting_datetime` | `timestamptz` | ○ | 集合（meeting）日時 | `CHECK (meeting_datetime <= start_datetime)` |
| `response_deadline_datetime` | `timestamptz` |  | 参加回答の締切 | リマインド対象抽出用 |
| `notes_markdown` | `text` |  | メモ/持ち物 | Markdown で保存 |
| `place_name` | `text` | ○ | 会場名 | - |
| `place_address` | `text` | ○ | 会場住所 | - |
| `place_google_id` | `text` |  | Google Place ID | スナップショット値。`UNIQUE` 制約なし |
| `place_latitude` | `double precision` |  | 座標（緯度） | UI でピン表示する場合のみ利用 |
| `place_longitude` | `double precision` |  | 座標（経度） | 同上 |
| `event_place_id` | `uuid` |  | 再利用用の会場参照 | `event_places.id` FK |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` FK（主に運営） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` FK。更新時に上書き |

**設計意図**
- ステータス列や論理削除は要件から除外し、物理削除で管理する。
- `event_place_id` は過去会場再選択のための候補参照のみで、表示は `place_*` のスナップショット値を利用して履歴改ざんを防ぐ。
- `response_deadline_datetime` を時刻情報まで保持し、リマインド通知のトリガーに使う（締切経過後も出欠操作は制限しない）。

**インデックス / 制約**
- `CREATE INDEX events_start_datetime_idx ON events (start_datetime DESC);` — 最新イベント一覧向け。
- `CREATE INDEX events_response_deadline_idx ON events (response_deadline_datetime);` — リマインドジョブ抽出用。
- CHECK 制約: `meeting_datetime <= start_datetime`。

## `event_places`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | 会場レコード ID | PK。`gen_random_uuid()` |
| `place_google_id` | `text` |  | Google Place ID | `UNIQUE(place_google_id) WHERE place_google_id IS NOT NULL` |
| `place_fingerprint` | `text` |  | 手入力重複排除キー | `UNIQUE(place_fingerprint) WHERE place_fingerprint IS NOT NULL` |
| `name` | `text` | ○ | 会場名 | - |
| `address` | `text` | ○ | 会場住所 | - |
| `latitude` | `double precision` |  | 座標（緯度） | - |
| `longitude` | `double precision` |  | 座標（経度） | - |
| `usage_count` | `integer` | ○ | 利用回数 | upsert 時に `usage_count = usage_count + 1` |
| `last_used_datetime` | `timestamptz` | ○ | 直近で使った日時 | - |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` FK（記録者） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / upsert で更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` FK |

**設計意図**
- `place_google_id` が取得できるケースではこれをキーに upsert、手入力時は `place_fingerprint` をキーとして扱い、履歴候補を 1 レコードに集約する。
- `usage_count` / `last_used_datetime` で候補をソートして UI に提案し、入力時間を短縮。

**インデックス / 制約**
- `UNIQUE(place_google_id) WHERE place_google_id IS NOT NULL`。
- `UNIQUE(place_fingerprint) WHERE place_fingerprint IS NOT NULL`。
- `CREATE INDEX event_places_last_used_idx ON event_places (last_used_datetime DESC);`。

## RLS / 権限メモ
- `events`: `manager` ロールのみ INSERT/UPDATE/DELETE を許可。`member` は SELECT のみ。
- `event_places`: `manager` のみ INSERT/UPDATE/DELETE、`member` は SELECT 不要（候補表示が運営専用であれば RLS で非公開も可）。

## 未決定事項 / Follow-up
- Google Maps 上でピンを描画する UI を正式に採用するか否か。採用する場合は `place_latitude` / `place_longitude` の取得を必須化し、検証に必要な API キー設定を docs に追記する。採用しない場合はカラム削減を検討。
