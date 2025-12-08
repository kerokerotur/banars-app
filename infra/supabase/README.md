# Supabase ディレクトリ運用ルール

## 役割
- Supabase CLI (`supabase db push`, `supabase functions deploy` など) に関する設定や成果物を管理します。
- データ層のソースコード (DDL / RLS / Edge Functions) をここでバージョン管理し、アプリ実装から独立させます。

## ディレクトリ構成
- `config.toml`: Supabase CLI の設定。
- `migrations/`: Supabase CLI が生成する SQL マイグレーション。**1 ファイルにつき 1 テーブル（または 1 つの共通オブジェクト）だけを扱い、他テーブルの操作を混在させない**ことで、ファイル名から意図を読み取れるようにします。
- `functions/`: Edge Functions のエントリポイント。各関数ごとにサブディレクトリを作成。
- `seed.sql`: ローカル開発用の初期データ。`supabase db reset` 時に自動適用。
- `.vscode/`: CLI 作業用の推奨設定 (任意)。

## マイグレーション作成・命名規則
- **ファイルは必ず Supabase CLI で生成すること。手書きで `touch` したり、既存ファイルをコピーして作らない。**
- コマンド例: `supabase migration new create_users`。CLI が `YYYYMMDDHHMMSS_create_users.sql` 形式のファイルを `migrations/` に生成します（タイムスタンプ + スネークケース名）。
- 1 ファイルにつき 1 テーブル（もしくは 1 つの共通コンポーネント）を扱う。複数テーブルの DDL/RLS を同じファイルに入れない。
- 共通トリガー／関数など、テーブルに紐付かないものを追加する場合は `supabase migration new setup_updated_at_trigger` など CLI で別ファイル化する。
- **既存のマイグレーションファイルは絶対に修正しない**。Supabase はリモート環境で適用済みのマイグレーションをファイル名で管理しているため、適用済みファイルを修正しても変更は反映されない。スキーマを変更したい場合は、必ず新しいマイグレーションファイルを作成して `ALTER TABLE` 等で修正すること。

## SQL コーディング規約
- 予約語 (CREATE, ALTER, GRANT など) はすべて大文字。
- テーブル/カラム名は `snake_case` 小文字。
- `timezone('utc', now())` のような関数呼び出しは PostgreSQL の命名に倣い小文字で問題ありません。

## 運用フロー
1. `supabase migration new <name>` を実行して `infra/supabase/migrations/` にファイルを作成し、前述の 1 テーブル 1 ファイルルールを必ず守る。
2. ローカルで `supabase db push` または `supabase db reset` を実行し、エラーがないことを確認。
3. 関連する DESIGN_DOCS / README に差分があれば同時に更新し、PR で適用手順を共有。

## シードデータ（初期データ）

ローカル開発・テストに必要な初期データは `seed.sql` に集約します。

### 適用タイミング

- **`supabase db reset`**: マイグレーション適用後に `seed.sql` が自動実行される
- **`supabase db push`**: シードは実行されない（マイグレーションのみ）

つまり、**本番環境には影響しません**。

### 用途

- テスト用ユーザー（manager ロールなど権限付きユーザー）
- 動作確認に必要なサンプルデータ
- チーム開発で共通の初期状態を再現

### 現在のシードデータ

| データ | 説明 |
| --- | --- |
| manager ユーザー | `manager@example.com` / `password123` - 招待トークン発行など manager 権限が必要な機能のテスト用 |

### 新しい初期データの追加

`seed.sql` に SQL を追記してください。`ON CONFLICT DO NOTHING` を使用して冪等性を担保することを推奨します。

## Edge Functions 作成・運用ルール
- **新規作成時は必ず CLI を使用する**: `supabase functions new <function名>` を実行すること。CLI が `functions/<function名>/` ディレクトリと `config.toml` への設定を自動生成する。手動でファイルやディレクトリを作成しない。
- **生成後の編集**: CLI が生成した `index.ts` と `deno.json` を編集して実装を行う。
- **アーキテクチャ**: Edge Function のエントリポイント (`index.ts`) は薄く保ち、ビジネスロジックは `backend/` 配下のコア層・アダプター層に実装する。
- **デプロイ時はバンドルが必須**: `backend/` 配下のコードを参照するため、デプロイ前に必ずバンドルを実行する。

### Edge Function 新規作成の手順
```bash
# 1. CLI で関数を作成
cd infra/supabase
supabase functions new <function名>

# 2. バンドルを実行（index.ts が src/ に移動され、config.toml が自動更新される）
cd ../..  # プロジェクトルートへ
make bundle-functions
```

生成・変換されるファイル:
- `functions/<function名>/src/index.ts` - ソースコード（CLI 生成後にバンドル時に自動移動）
- `functions/<function名>/dist/index.ts` - バンドル出力（gitignore、デプロイ対象）
- `functions/<function名>/deno.json` - 依存関係マッピング（空の imports で生成）
- `config.toml` への設定追加（自動）+ entrypoint の自動修正

## Edge Functions バンドル

### なぜバンドルが必要か

Edge Function のエントリポイント (`src/index.ts`) は `backend/` 配下のコア層・アダプター層を参照しますが、Supabase CLI は `functions/` ディレクトリ内のファイルのみをアップロードします。そのため、デプロイ前に esbuild で全ての依存関係を含めたバンドルを生成します。

### バンドルコマンド

```bash
# プロジェクトルートで実行
make bundle-functions    # バンドルのみ
make deploy-functions    # バンドル + デプロイ
```

### バンドルスクリプトの動作

`backend/scripts/bundle-functions.ts` は以下を自動実行します：

1. **ファイル構造の自動変換**: `index.ts` が存在し `src/index.ts` がない場合、自動的に `src/` へ移動
2. **バンドル生成**: `src/index.ts` を esbuild でバンドルし `dist/index.ts` へ出力
3. **config.toml 更新**: 各関数の `entrypoint` を `dist/index.ts` に自動修正

### ディレクトリ構成（バンドル後）

```
functions/
├── deno.json                    # 全Edge Function共通の依存関係
├── initial_signup/
│   ├── src/
│   │   └── index.ts             # ソースコード
│   ├── dist/
│   │   └── index.ts             # バンドル出力（gitignore）
│   └── deno.json
└── invite_issue/
    ├── src/
    │   └── index.ts
    ├── dist/
    │   └── index.ts
    └── deno.json
```

## Edge Functions 依存関係管理

### Deno の依存解決の仕組み

Denoは以下の順序で`deno.json`を探索し、**複数のファイルが見つかった場合はマージ**します：

1. `functions/<function名>/deno.json` （関数固有の依存）
2. `functions/deno.json` （全関数共通の依存）

この仕組みを利用して、**ハイブリッド構成**で依存関係を管理します。

### ディレクトリ構成

```
functions/
├── deno.json                    # 全Edge Function共通の依存関係
├── initial_signup/
│   ├── index.ts
│   └── deno.json                # この関数固有の依存関係（空でもOK）
└── invite_issue/
    ├── index.ts
    └── deno.json                # この関数固有の依存関係（空でもOK）
```

### functions/deno.json（共通依存）

全Edge Functionで使用する共通ライブラリを定義：

```json
{
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2.45.4",
    "jose": "npm:jose@5.2.4",
    "hono": "jsr:@hono/hono@^4.6.14",
    "zod": "npm:zod@^3.23.8",
    "@hono/zod-validator": "npm:@hono/zod-validator@^0.4.1"
  }
}
```

**管理ルール:**
- プロジェクト全体で使う基本ライブラリのみを記載
- バージョン更新時は一箇所を変更するだけで全関数に反映
- Supabase CLI で `supabase functions new` を実行しても**上書きされない**

### functions/<function名>/deno.json（関数固有依存）

各Edge Function固有のライブラリを定義：

```json
{
  "imports": {
    "some-library": "npm:some-library@1.0.0"
  }
}
```

**管理ルール:**
- Supabase CLI で `supabase functions new` を実行すると**空の imports で自動生成**
- この関数でのみ使うライブラリがある場合に追記
- 親の `functions/deno.json` と自動的にマージされる
- 空の `{}` のままでも問題ない（親の依存のみ使う場合）

### 依存関係の追加手順

**ケース1: 全関数で使う共通ライブラリを追加**

```bash
# functions/deno.json を編集
{
  "imports": {
    "new-library": "npm:new-library@1.0.0"  # ← 追加
  }
}
```

**ケース2: 特定の関数でのみ使うライブラリを追加**

```bash
# functions/specific_function/deno.json を編集
{
  "imports": {
    "specific-library": "npm:specific-library@1.0.0"  # ← 追加
  }
}
```

### バージョン管理のベストプラクティス

1. **共通ライブラリはバージョンを固定** (`@2.45.4` のように exact version)
2. **Hono/Zodは互換範囲を指定** (`^4.6.14` のように semver range)
3. **バージョン更新時は全Edge Functionのテストを実行**してから反映
4. **関数固有の依存は最小限にとどめる**（可能な限り共通化）

`infra/README.md` も併せて参照し、IaC 全体の方針を把握してください。
