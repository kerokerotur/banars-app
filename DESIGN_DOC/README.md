# DESIGN_DOC の読み方

banars アプリの技術設計ドキュメントを集約しています。変更や参照の際は以下の流れで確認してください。

## 推奨の読了順
1. [`overview.md`](overview.md): アプリ全体のアーキテクチャ、採用技術、ドメインコンテキストの一覧を俯瞰します。
2. コンテキスト別ディレクトリ: イベント・出欠・認証など、各コンテキスト配下の機能別 Markdown を参照します。
3. 必要に応じて PRD や実装コードへ往復し、意思決定の背景と実装戦略に齟齬がないかを確認します。

## ディレクトリ構成と機能
| パス | 説明 | 代表機能 / 詳細ドキュメント |
| --- | --- | --- |
| `overview.md` | 全体アーキテクチャと横断テーマのサマリ。 | アプリ構成・技術選定を集約。 |
| `events/` | イベント作成と公開のフローを管理。 | [`event_overview.md`](events/event_overview.md)（イベント一覧/詳細の要件）、[`event_creation.md`](events/event_creation.md)（開催登録フロー）。 |
| `attendance/` | 出欠収集とリマインドの設計。 | [`attendance_status.md`](attendance/attendance_status.md)（出欠のステータス管理）、[`reminder_flow.md`](attendance/reminder_flow.md)（通知と締切リマインダ）。 |
| `auth/` | LINE 認証を中心としたアカウント管理。 | [`line_login.md`](auth/line_login.md)（LINE トークン検証と Supabase セッション化）、[`signup_flow.md`](auth/signup_flow.md)（会員登録ハンドオフ）。 |

## 更新チェックリスト
- コンテキストやファイルを追加・改訂したら、`overview.md` のリンク/サマリとこの README の表を同時に更新する。
- 依存サービスや設計判断を変えた場合は、背景となる理由と影響範囲を各ファイルに追記する。
- PRD の要求が変化した際は、まず PRD を更新 → 関連する DESIGN_DOC を更新 → README / overview の導線を見直す順で反映する。
