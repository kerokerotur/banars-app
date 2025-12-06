# ディレクトリ構成ガイド

## 目的
- Flutter クライアント、バックエンドロジック、インフラ/IaC をモノレポ内で分離し、担当領域ごとの依存を可視化する。
- Edge Function 向けのビジネスロジックを Supabase から切り離し、品質担保しやすいテスト境界を確保する。
- ドキュメントを `docs/` に集約し、AI エージェント向けルール（`AGENTS.md`）はリポジトリ直下に残すという責務分担を明示する。

## ドキュメントの役割
- ルート `README.md`: 人間向けのハブ。各ディレクトリ README や資料へのリンクと概要のみを掲載し、詳細説明は下位ドキュメントへ委譲する。
- `AGENTS.md`: AI エージェント向けルール集。エージェント運用やコマンド制約など、人には不要な情報をまとめる。
- `docs/PRD.md`: プロダクトの背景・ステークホルダー・体験要件を記述するソースオブトゥルース。実装詳細は含めない。
- `docs/DESIGN_DOCS/`: 技術設計と実装方針を集約するディレクトリ。各コンテキスト README や機能ごとの Markdown が責務を持ち、PRD との分担を守る。

## 新規ディレクトリと役割
### `apps/mobile/`
- Flutter 3.x の唯一のクライアントアプリを配置するルート。
- プラットフォーム固有ディレクトリ（`ios/`, `android/` など）は Flutter 標準構成に従ってこの配下へ展開する。
- ドメイン別の presentation / application レイヤを `lib/` 以下で切り分ける際のベースとなる。

### `backend/core/`
- TypeScript 製の純粋なドメインロジック、ユースケース、サービス、リポジトリインターフェースを配置する。
- Supabase SDK や Deno API への依存を禁止し、ユニットテスト（例: Vitest, Deno test など）をこの層で完結させる。
- 将来的に別ホスティングへ移行する際はこの層をそのまま再利用し、アダプタのみ差し替える想定。

### `backend/adapters/supabase/`
- Supabase Edge Function 専用のアダプタ実装とエントリポイントを配置する。
- HTTP リクエスト/レスポンスの整形、Supabase SDK の呼び出し、`backend/core` への委譲を担当する。
- ビルド成果物は `infra/supabase/functions/` へコピーして `supabase functions deploy` で配信する。

### `infra/supabase/`
- Supabase CLI (config, migrations, seed, functions) を使った IaC を格納するディレクトリ。
- `supabase/config.toml`, `migrations/`, `seed.sql`, `functions/` などをこの配下で管理し、環境差異をなくす。

### `infra/tooling/`
- Supabase 以外の IaC（Terraform や GitHub Actions 用ワークフロー定義など）を格納する余地。
- 現時点では空ディレクトリだが、OneSignal や通知周辺の設定が必要になった場合はこの配下にモジュールを追加する。

### `docs/`
- README の補足資料、`docs/PRD.md`、`docs/DESIGN_DOCS/` など人間向けドキュメントの集約場所。
- 今後ファイルを移設する際は本ガイドを更新し、`README.md` から導線を案内する。

## 運用メモ
- `AGENTS.md` は従来どおりリポジトリ直下に配置し、AI エージェントが起動時に最初に参照できるようにする。
