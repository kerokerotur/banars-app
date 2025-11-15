# 出欠リマインド (Attendance Remind)

## 目的
- 未回答メンバーへ適切なタイミングで通知を送り、締切前に出欠を集め切る。
- 通知チャネル（プッシュ/LINE/メール）を段階的に増やす余地を残す。

## トリガー
- イベント作成時に `rsvp_deadline` の 48 時間前をデフォルト設定。
- Edge Function `attendance_remind` が Supabase スケジューラから呼ばれ、対象イベントの未回答メンバーを抽出。
- 運営が手動でリマインドしたい場合はイベント詳細から即時実行ボタンを用意。

## 通知フロー
1. `attendance` テーブルから `status IS NULL OR status='pending'` のユーザー一覧取得。
2. OneSignal REST API へ `segments` 指定で送信。LINE 通知は将来的に Messaging API を併用予定。
3. 通知送信結果は `attendance_remind_logs` に保存し、イベント詳細に履歴を表示。

## 技術ポイント
- Edge Function から Supabase Service Role Key を利用し、RLS を迂回して全ユーザーへアクセス。
- スケジュール設定は Supabase Dashboard の `cron` を利用し、イベント数に応じて 5 分刻みでバッチ実行。
- 通知失敗時はリトライキューを Redis ではなく Supabase `retry_jobs` テーブルで代替し、Free プランでも運用可能にする。

## 決定理由
- 自動リマインドにより手動での個別連絡を減らし、運営コストを削減。
- ログ保存で「いつ誰に通知したか」を可視化し、未回答者へのフォローが重複しないよう配慮。
