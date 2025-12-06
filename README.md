# banars-app

banars 草野球チームの運営を支援するモバイルアプリのモノレポです。本 README は下位ドキュメントへの索引のみを提供し、各種ルールや詳細は該当ディレクトリの README に委譲します。

## README / Docs インデックス
| ディレクトリ | README | 主な記載内容 |
| --- | --- | --- |
| `apps/mobile/` | [`apps/mobile/README.md`](apps/mobile/README.md) | Flutter アプリ開発手順、FVM+derry のコマンド一覧、セットアップフロー。 |
| `backend/` | [`backend/README.md`](backend/README.md) | Supabase Edge Functions/ドメインロジックのレイヤリングとテスト方針。 |
| `docs/DESIGN_DOCS/` | [`docs/DESIGN_DOCS/README.md`](docs/DESIGN_DOCS/README.md) | 設計ドキュメントの読み方、各コンテキストのリンク、データモデル運用ルール。 |
| `docs/` | [`docs/PRD.md`](docs/PRD.md) | アプリの背景、ステークホルダー、体験要件をまとめた PRD。 |
| `infra/` | [`infra/README.md`](infra/README.md) | IaC/Supabase の管理ポリシーとサブディレクトリ案内。 |
| `infra/supabase/` | [`infra/supabase/README.md`](infra/supabase/README.md) | Supabase CLI 運用、マイグレーション命名規則、SQL コーディング規約。 |

### その他
- AI エージェント向けルールは `AGENTS.md` を参照してください。
- 人向け以外の技術仕様や追加資料は、該当ディレクトリの README／ドキュメントに集約し、本ファイルには概要のみを残します。
