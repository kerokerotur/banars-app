# データモデル（tables.md）テンプレート

## 使い方
- 各コンテキスト配下の `tables.md` は本テンプレートに沿って作成する。
- カラム定義は下表フォーマットを必ず使い、PK / FK / UNIQUE / CHECK などの制約は列単位の「制約」に明記する。
- 「必須」列は `○` で必須カラムを表す（任意カラムは空欄のまま）。
- 複数テーブルを記載する場合は、「## `table_name`」見出しをテーブルごとに付ける。
- インデックスや RLS 方針などカラム以外の情報は、テーブル定義の直後に箇条書きで追記する。
- 監査メタデータは `created_at` / `created_user` / `updated_at` / `updated_user` の 4 列をセットで持ち、説明欄は「メタデータ」と記載する。

## セクション例

### `sample_table`
| カラム | 型 | 必須 | 説明 | 制約 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | ○ | レコード識別子 | PK。`gen_random_uuid()` |
| `example_value` | `text` |  | ビジネスロジックの説明 | `CHECK (char_length(example_value) > 0)` |
| `created_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` |
| `created_user` | `uuid` |  | メタデータ | `users.id` FK |
| `updated_at` | `timestamptz` | ○ | メタデータ | `DEFAULT now()` / トリガ更新 |
| `updated_user` | `uuid` |  | メタデータ | `users.id` FK |

**インデックス / 制約メモ（任意）**
- `CREATE INDEX sample_table_example_value_idx ON sample_table (example_value);`

**RLS / 権限メモ（任意）**
- 例: `manager` のみ INSERT/UPDATE/DELETE、`member` は SELECT のみ。
