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
| `address` | `text` | ○ | 会場住所 | - |
| `latitude` | `double precision` |  | 座標（緯度） | Nominatim 検索時に取得 |
| `longitude` | `double precision` |  | 座標（経度） | Nominatim 検索時に取得 |
| `osm_id` | `bigint` |  | OSM ID | Nominatim 検索時に取得 |
| `osm_type` | `text` |  | OSM type | node/way/relation |
| `place_fingerprint` | `text` |  | 手入力重複排除キー | 会場名+住所のハッシュ |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` 参照（記録者） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / upsert で更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` 参照 |

**設計意図**

- `osm_id` / `osm_type` が取得できるケース（Nominatim 検索）ではこれをキーに upsert、手入力時は `place_fingerprint` をキーとして扱い、履歴候補を 1 レコードに集約する。
- OpenStreetMap の Nominatim API を使用することで、無料で位置情報を取得可能（レート制限: 1秒1リクエスト）。

**インデックス / 制約**

- `UNIQUE(osm_type, osm_id) WHERE osm_id IS NOT NULL` — Nominatim 検索結果の重複排除。
- `UNIQUE(place_fingerprint) WHERE place_fingerprint IS NOT NULL` — 手入力の重複排除。

## RLS / 権限メモ

event コンテキストのテーブル（`event_types`, `events`, `event_places`）は RLS を設定せず、チームメンバー全員が自由に操作できるようにする。

## 未決定事項 / Follow-up

- OpenStreetMap (flutter_map) 上でピンを描画する UI を正式に採用するか否か。採用する場合は `latitude` / `longitude` の取得を必須化する。採用しない場合はカラム削減を検討。
