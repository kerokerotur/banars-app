# イベント作成 (Event Create)

## 目的
- 運営が 1 分以内で新規イベントを登録し、必要な通知設定まで完了できるフローを提供する。
- 入力漏れや日付整合性をサーバー/クライアント双方で担保し、誤配信やダブルブッキングを防ぐ。

## フォーム項目
1. 基本情報: タイトル、開催種別（試合/練習/その他）、開始日時、集合日時、Google Maps 検索。
2. 会場: Place 検索結果から `place_id` と座標を保存。手入力時も緯度経度必須。
3. 募集設定: 定員、参加期限、下書きフラグ、公開対象（全員/グループ）。
4. 詳細: 持ち物、連絡事項（Markdown 対応）。

## バリデーション
- `start_at` >= `gather_at`、`rsvp_deadline` <= `start_at`、必須項目チェックをクライアントで実施。
- Supabase Edge Function `events_validate` を下書き保存前に呼び、ダブルブッキング（同時間帯/会場）を検出。

## データフロー
- Flutter で入力 → Supabase Row Level Security を通過した `events` テーブルに INSERT。
- 成功後に Edge Function `notifications_enqueue` へイベント ID を渡し、OneSignal キュー登録。

## 決定理由
- Edge Function で重複検知を集中実装することで、将来の Web 管理画面追加時も同じロジックを再利用できる。
- 下書き保存を設けることで、運営が情報確定前に PRD 上の要件（公開前の調整期間）を満たせる。
