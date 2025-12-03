# infra ディレクトリ概要

`infra/` は IaC (Infrastructure as Code) や開発環境全般の定義を集約する領域です。現時点では以下の内容を管理します。

- `supabase/`: Supabase CLI 用の設定・マイグレーション・Edge Functions 等を配置します。App のデータ層変更は必ずここから適用します。
- `tooling/`: Supabase 以外の IaC（例: Terraform、CI/CD 設定、通知サービス設定）を追加するためのプレースホルダーです。

更新時の基本方針:
1. 設計のソースオブトゥルースは `docs/` 配下の PRD / DESIGN_DOCS。インフラ変更も必ずそちらの意図を満たすか確認します。
2. 変更単位ごとに README やドキュメントへ追記し、他メンバーが運用手順を再現できる状態を維持します。
3. Supabase 関連のコマンドは `infra/supabase/README.md` のルールに従い、**CLI（`supabase migration new ...` 等）経由でのみファイルを生成**し、実行ログを残せるようにします。
