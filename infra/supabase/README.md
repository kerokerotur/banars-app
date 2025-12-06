# Supabase ディレクトリ運用ルール

## 役割
- Supabase CLI (`supabase db push`, `supabase functions deploy` など) に関する設定や成果物を管理します。
- データ層のソースコード (DDL / RLS / Edge Functions) をここでバージョン管理し、アプリ実装から独立させます。

## ディレクトリ構成
- `config.toml`: Supabase CLI の設定。
- `migrations/`: Supabase CLI が生成する SQL マイグレーション。**1 ファイルにつき 1 テーブル（または 1 つの共通オブジェクト）だけを扱い、他テーブルの操作を混在させない**ことで、ファイル名から意図を読み取れるようにします。
- `functions/`: Edge Functions のエントリポイント。各関数ごとにサブディレクトリを作成。
- `.vscode/`: CLI 作業用の推奨設定 (任意)。

## マイグレーション作成・命名規則
- **ファイルは必ず Supabase CLI で生成すること。手書きで `touch` したり、既存ファイルをコピーして作らない。**
- コマンド例: `supabase migration new create_users`。CLI が `YYYYMMDDHHMMSS_create_users.sql` 形式のファイルを `migrations/` に生成します（タイムスタンプ + スネークケース名）。
- 1 ファイルにつき 1 テーブル（もしくは 1 つの共通コンポーネント）を扱う。複数テーブルの DDL/RLS を同じファイルに入れない。
- 共通トリガー／関数など、テーブルに紐付かないものを追加する場合は `supabase migration new setup_updated_at_trigger` など CLI で別ファイル化する。

## SQL コーディング規約
- 予約語 (CREATE, ALTER, GRANT など) はすべて大文字。
- テーブル/カラム名は `snake_case` 小文字。
- `timezone('utc', now())` のような関数呼び出しは PostgreSQL の命名に倣い小文字で問題ありません。

## 運用フロー
1. `supabase migration new <name>` を実行して `infra/supabase/migrations/` にファイルを作成し、前述の 1 テーブル 1 ファイルルールを必ず守る。
2. ローカルで `supabase db push` または `supabase db reset` を実行し、エラーがないことを確認。
3. 関連する DESIGN_DOCS / README に差分があれば同時に更新し、PR で適用手順を共有。

## Edge Functions 作成・運用ルール
- **新規作成時は必ず CLI を使用する**: `supabase functions new <function名>` を実行すること。CLI が `functions/<function名>/` ディレクトリと `config.toml` への設定を自動生成する。手動でファイルやディレクトリを作成しない。
- **生成後の編集**: CLI が生成した `index.ts` と `deno.json` を編集して実装を行う。
- **アーキテクチャ**: Edge Function のエントリポイント (`index.ts`) は薄く保ち、ビジネスロジックは `backend/` 配下のコア層・アダプター層に実装する。
- **依存関係**: 外部パッケージは各関数の `deno.json` の `imports` に追加する。

### Edge Function 新規作成の手順
```bash
cd infra/supabase
supabase functions new <function名>
```

生成されるファイル:
- `functions/<function名>/index.ts` - エントリポイント
- `functions/<function名>/deno.json` - 依存関係マッピング
- `config.toml` への設定追加（自動）

`infra/README.md` も併せて参照し、IaC 全体の方針を把握してください。
