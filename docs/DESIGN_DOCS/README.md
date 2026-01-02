# DESIGN_DOCS の読み方

banars アプリの技術設計ドキュメントを集約しています。変更や参照の際は以下の流れで確認してください。

## 推奨の読了順
1. [`overview.md`](overview.md): アプリ全体のアーキテクチャ、採用技術、ドメインコンテキストの一覧を俯瞰します。
2. コンテキスト別ディレクトリ: イベント・出欠・認証など、各コンテキスト配下の機能別 Markdown を参照します。
3. 必要に応じて PRD（[`../PRD.md`](../PRD.md)）や実装コードへ往復し、意思決定の背景と実装戦略に齟齬がないかを確認します。

## 運用ルール
- **フォルダ構成**: `docs/DESIGN_DOCS/overview.md` に全体アーキテクチャとコンテキスト一覧を集約し、各コンテキストは `docs/DESIGN_DOCS/{context}/` に単位ごとで配置します。
- **命名と粒度**: ディレクトリ名は英小文字スネークケース、ファイル名は機能内容を想起できる英単語とし、同一コンテキストの機能群をまとめます。
- **記載内容**: 実装方針・依存サービス・権限設計・データモデル・意思決定理由を明記し、PRD に書かれた意図を技術的にどう実現するかを説明します。
- **更新手順**: コンテキストや機能を追加/変更した際は、該当ファイルと `overview.md` のリンク/説明を同時に更新し、ドキュメントナビゲーションを最新化します。編集は関係者と対話しながら進めてください。

## データモデル運用ルール
- データモデル（テーブル定義/列仕様）は必ずコンテキスト単位の `tables.md` に集約します。例: `events/tables.md`, `auth/tables.md`。
- 1 コンテキストにつき 1 ファイルを原則とし、派生資料は同ディレクトリ内に置きます（他ファイルへ分散させない）。
- 命名規則・型の方針・共通のバリデーションルールなど、コンテキスト横断で共有したい内容は本 README に追記し、`tables.md` から参照します。
- 機能ドキュメントにはテーブルの抜粋を転載せず、`tables.md` へのリンクで参照するだけに留めます。
- 日時カラムは `*_datetime` の命名で `timestamptz (UTC)` を採用し、クライアントで端末タイムゾーンへ変換して表示します（監査列の `created_at` / `updated_at` は既存命名を継続）。
- カラム定義の表は [`template_tables.md`](template_tables.md) のフォーマットを使用します。列構成は「カラム / 型 / 必須 / 説明 / 制約」とし、必須列には `○` を入れます（任意列は空欄）。デフォルト値専用列は設けず、必要な場合は「制約」に記載します。
- 各テーブルは監査メタデータとして `created_at` / `created_user` / `updated_at` / `updated_user` の 4 列を必ず持ち、説明欄は「メタデータ」と記載します。
- **外部キー制約（FOREIGN KEY / REFERENCES）は原則として設定しない**: 本アプリは簡易的なアプリであり、レコード間の厳密な参照整合性よりも、柔軟なデータ変更を優先する。参照整合性が必要な場合はアプリケーション層で担保する。
- **複数テーブルのJOINが必要な情報取得はViewテーブルを作成する**: 本アプリではアプリ側でDBアクセス用にsupabase-jsを使用しているが、supabase-jsを使ってJOINして取得する場合は外部キーを定義している必要がある。外部キーを運用しない方針の本アプリでは、アプリでJOINして取得することができないため、Viewテーブルを作成してDB側でJOINした結果をアプリで取得するのを主な方針とする。


## 機能一覧とコンテキスト
| 機能 | コンテキスト (ディレクトリ) | 詳細ドキュメント |
| --- | --- | --- |
| 全体アーキテクチャ / 横断テーマ | 全体 (`overview.md`) | [`overview.md`](overview.md) |
| イベント一覧 | イベント (`events/`) | [`event_list.md`](events/event_list.md) |
| イベント一覧（出欠者表示） | イベント (`events/`) | [`event_list_attendances.md`](events/event_list_attendances.md) |
| イベント詳細 | イベント (`events/`) | [`event_detail.md`](events/event_detail.md) |
| イベント作成 | イベント (`events/`) | [`event_create.md`](events/event_create.md) |
| イベント削除 | イベント (`events/`) | [`event_delete.md`](events/event_delete.md) |
| イベント編集 | イベント (`events/`) | [`event_edit.md`](events/event_edit.md) |
| イベントデータモデル | イベント (`events/`) | [`tables.md`](events/tables.md) |
| 出欠データモデル | 出欠 (`attendance/`) | [`tables.md`](attendance/tables.md) |
| 出欠一覧 | 出欠 (`attendance/`) | [`attendance_list.md`](attendance/attendance_list.md) |
| 出欠登録 | 出欠 (`attendance/`) | [`attendance_register.md`](attendance/attendance_register.md) |
| 出欠編集 | 出欠 (`attendance/`) | [`attendance_edit.md`](attendance/attendance_edit.md) |
| 出欠リマインド | 出欠 (`attendance/`) | [`attendance_remind.md`](attendance/attendance_remind.md) |
| LINE ログイン | 認証 (`auth/`) | [`line_login.md`](auth/line_login.md) |
| 初回登録 | 認証 (`auth/`) | [`initial_signup.md`](auth/initial_signup.md) |
| 招待リンク発行 | 認証 (`auth/`) | [`invite_issue.md`](auth/invite_issue.md) |
| ユーザ情報取得 | 認証 (`auth/`) | [`get_me.md`](auth/get_me.md) |
| ユーザ一覧取得 | ユーザ (`user/`) | [`user_list.md`](user/user_list.md) |

## 後続対応 (バックログ)
- 認証: LINE プロフィール情報の再同期タイミング（ログイン毎の自動同期 or 手動更新）を設計し、`user_details` 更新フローに反映する。
- 認証: 招待リンク発行の履歴表示・無効化機能の要否を検討し、必要であれば実装する。
