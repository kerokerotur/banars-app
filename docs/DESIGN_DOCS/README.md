# DESIGN_DOCS の読み方

banars アプリの技術設計ドキュメントを集約しています。変更や参照の際は以下の流れで確認してください。

## 推奨の読了順
1. [`overview.md`](overview.md): アプリ全体のアーキテクチャ、採用技術、ドメインコンテキストの一覧を俯瞰します。
2. コンテキスト別ディレクトリ: イベント・出欠・認証など、各コンテキスト配下の機能別 Markdown を参照します。
3. 必要に応じて PRD（[`../PRD.md`](../PRD.md)）や実装コードへ往復し、意思決定の背景と実装戦略に齟齬がないかを確認します。

## 機能一覧とコンテキスト
| 機能 | コンテキスト (ディレクトリ) | 詳細ドキュメント |
| --- | --- | --- |
| 全体アーキテクチャ / 横断テーマ | 全体 (`overview.md`) | [`overview.md`](overview.md) |
| イベント一覧 | イベント (`events/`) | [`event_list.md`](events/event_list.md) |
| イベント詳細 | イベント (`events/`) | [`event_detail.md`](events/event_detail.md) |
| イベント作成 | イベント (`events/`) | [`event_create.md`](events/event_create.md) |
| イベント削除 | イベント (`events/`) | [`event_delete.md`](events/event_delete.md) |
| イベント編集 | イベント (`events/`) | [`event_edit.md`](events/event_edit.md) |
| 出欠一覧 | 出欠 (`attendance/`) | [`attendance_list.md`](attendance/attendance_list.md) |
| 出欠登録 | 出欠 (`attendance/`) | [`attendance_register.md`](attendance/attendance_register.md) |
| 出欠編集 | 出欠 (`attendance/`) | [`attendance_edit.md`](attendance/attendance_edit.md) |
| 出欠リマインド | 出欠 (`attendance/`) | [`attendance_remind.md`](attendance/attendance_remind.md) |
| LINE ログイン | 認証 (`auth/`) | [`line_login.md`](auth/line_login.md) |
| 初回登録 | 認証 (`auth/`) | [`initial_signup.md`](auth/initial_signup.md) |

## 後続対応 (バックログ)
- 認証: 招待リンク（invite_token）発行 UI をアプリ内へ実装し、Supabase コンソール依存を解消する。
- 認証: LINE プロフィール情報の再同期タイミング（ログイン毎の自動同期 or 手動更新）を設計し、`user_details` 更新フローに反映する。
