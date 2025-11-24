# Supabase ディレクトリ運用ルール

## 役割
- Supabase CLI (`supabase db push`, `supabase functions deploy` など) に関する設定・スクリプト・成果物を一元管理します。
- テーブル定義や RLS など、データ層のソースコードはすべてここでバージョン管理し、Flutter/Edge Function 実装から独立させます。

## ディレクトリ構成
- `migrations/`: SQL ベースのマイグレーション。DDL と RLS をここで管理します。
- `functions/`: Edge Function のビルド成果物を配置予定（未作成の場合は空で可）。
- `config/`, `seed.sql` など: 必要に応じて追加し、本 README に反映します。

## マイグレーション命名規則
- Flyway 風のバージョニングを採用します。`V<整数>__<スネークケース説明>.sql` としてください。
  - 例: `V1__create_initial_signup_tables.sql`, `V2__add_events_tables.sql`
  - 整数は 1 からの単調増加。ブランチ間の競合が起きた場合は後勝ち側がリネームして番号を進めます。
- 既存の 2025 日付ベースファイルは順次この命名規則へ移行します。

## SQL コーディング規約
- SQL 予約語 (CREATE, ALTER, INSERT, UPDATE, DELETE, SELECT, BEGIN など) は **必ず大文字**で記述します。
- スキーマ/テーブル/カラム名は `snake_case` を維持し、小文字で統一します。
- `timezone('utc', now())` のような関数呼び出しは PostgreSQL 標準関数名に合わせて小文字/大文字を混在させても構いません。

## 運用フロー
1. 新規マイグレーションを作成するときは `migrations/` にファイルを追加し、本 README の規則に従った名称を付けます。
2. ローカルで `supabase db push` を実行し、エラーがないことを確認します。
3. 適用後は関連する DESIGN_DOCS を更新し、PR の説明に適用手順を記載します。

## 参考
- ディレクトリ全体の目的は `infra/README.md` を参照してください。
