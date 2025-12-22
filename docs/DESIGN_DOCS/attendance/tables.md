# 出席コンテキストのテーブル定義

## `attendance`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | 出欠レコード ID | PK。`gen_random_uuid()` |
| `event_id` | `uuid` | ○ | イベント ID | `events.id` 参照 |
| `member_id` | `uuid` | ○ | メンバー ID | `user.id` 参照（出欠登録するメンバー） |
| `status` | `text` | ○ | 出欠ステータス | `CHECK (status IN ('attending', 'not_attending', 'pending'))` |
| `comment` | `text` |  | 任意コメント | 理由や補足情報を自由記述 |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `user.id` 参照（登録者） |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `user.id` 参照（更新者） |

**設計意図**
- メンバーが最小操作で出欠（出席 / 欠席 / 保留）とコメントを登録できるシンプルな構造。
- `(event_id, member_id)` のユニーク制約により、1 イベントにつき 1 メンバー 1 回答のみ保証。UPSERT 操作で既存回答を更新。
- FK 制約は設定せず、アプリケーション層で参照整合性を担保（プロジェクトポリシーに準拠）。
- コメントは常に任意入力。出席・欠席・保留のいずれの場合も自由に記述可能。
- `created_user` と `updated_user` は出欠登録・更新を行ったメンバー本人の ID を記録（監査用）。

**ステータス値**
- `attending`: 参加（出席）
- `not_attending`: 不参加（欠席）
- `pending`: 保留（調整中）

**インデックス / 制約**
- `UNIQUE (event_id, member_id)` — 1 イベント・1 メンバーにつき 1 回答のみ。UPSERT 実現のキー。
- `CREATE INDEX attendance_event_id_idx ON attendance (event_id);` — イベントごとの出欠一覧取得用。
- `CREATE INDEX attendance_member_id_idx ON attendance (member_id);` — メンバーごとの出欠履歴取得用。

## RLS / 権限メモ

attendance テーブルは RLS を設定せず、チームメンバー全員が自由に操作できるようにする。ただし、締切 (`events.response_deadline_datetime`) 経過後の変更は、Edge Function 側で権限チェックを実施：
- **締切前**: すべてのメンバーが自分の出欠を登録・更新可能
- **締切後**: 読み取り専用

## 未決定事項 / Follow-up

- Slack / LINE への通知機能（出欠登録時の Webhook トリガー）。
- 出欠状況の集計・表示機能（別途設計予定）。
