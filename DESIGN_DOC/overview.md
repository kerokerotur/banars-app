## アーキテクチャサマリ

- **クライアント層**: Flutter 製モバイルアプリを単一コードベースで iOS / Android に配信。
- **バックエンド / データ層**: Supabase Free プラン上の PostgreSQL を中核に据え、Auth・Storage・Realtime・Edge Functions を活用する。アプリからの API 呼び出しは Supabase Auth が発行した JWT を用い、RLS で運営ロールとメンバーロールを制御する。
- **外部サービス**: Google Maps Platform で会場位置を可視化し、OneSignal Free で通知/リマインドを配信する。LINE の ID トークンは Edge Function で検証して Supabase セッションに交換するため、クライアントは以降 Supabase 発行トークンのみを利用する。

## 技術スタックと選定理由

| レイヤー | 採用技術 | 選定理由 |
| --- | --- | --- |
| モバイルクライアント | Flutter 3.x + Dart | 2025 年時点で公式 LINE SDK / Google Maps プラグインが揃っており、単一コードベースで UI を提供できる。Impeller による描画安定性とホットリロードで個人開発でも開発効率を維持できる。 |
| 認証・データ | Supabase (Free) + PostgreSQL | Must 要件の RDB 需要を満たしつつ、Auth / Storage / Realtime / Edge Function がパッケージ化されているため運用コストを最低限に抑えられる。チーム 20〜30 人規模なら Free 枠内で十分に運用可能。 |
| 地図 | Google Maps SDK for Flutter | モバイル向け Maps SDK が無料で無制限利用でき、ユーザーに馴染みのある UI を提供できる。Flutter 公式プラグインが Google によりメンテされている点も評価。 |
| 通知 | OneSignal Free (REST API) | 無料枠でモバイルプッシュが無制限、REST ベースの送信で将来の定期リマインドやセグメント配信を組みやすい。サーバを自前で持たずに通知運用が可能。 |
| インフラ / 配布 | Supabase マネージド基盤, （モバイル配布: 後日決定） | バックエンドは Supabase 上で完結。モバイルのビルド/配布チャネルは今後選定し、本ドキュメントを更新する。 |

## ドメインコンテキスト一覧

| ディレクトリ | コンテキスト名 |
| --- | --- |
| [DESIGN_DOC/events/](events) | イベントコンテキスト |
| [DESIGN_DOC/attendance/](attendance) | 出欠コンテキスト |
| [DESIGN_DOC/auth/](auth) | 認証コンテキスト |

> 個別機能への導線は `DESIGN_DOC/README.md` の機能一覧に統一し、overview ではディレクトリとコンテキスト名のみ管理する。

## 横断テーマ

### 認証 / 権限
- LINE Login SDK で取得した ID トークンを Supabase Edge Function へ送信し、LINE JWKS で検証した後に Supabase セッションを発行する。
- セッション以降は `supabase_flutter` の PKCE / リフレッシュ機能を利用し、クライアント側でトークンを保持。Supabase の RLS で `manager` / `member` 判定を行い、events への INSERT や attendance 集計アクセスを制御する。

### 地図表示
- すべてのイベントは Google Maps Platform の座標/Place ID を保持し、Flutter アプリで `google_maps_flutter` を使ってプレビュー表示する。
- フリー枠内で運用するため、Routes / Places API の従量課金を発生させる機能（経路検索など）は初期リリースには含めない。

### 通知 / リマインド
- OneSignal REST API を呼び出す Edge Function を用意し、イベント新規作成や締切リマインドをトリガーから送信する。
- 将来の自動リマインダーは Supabase の定期実行（cron）または外部スケジューラから Edge Function を叩く構成を採用し、OneSignal のセグメント配信機能で対象メンバーを指定する。

### インフラ運用
- Supabase Free プランを前提とし、使用量が閾値に近づいたら Pro への移行を検討する。Edge Function / Storage / Realtime の利用状況は Supabase ダッシュボードで監視する。
- 秘匿情報（LINE Channel Secret, OneSignal API Key, Supabase Service Role Key）は Supabase プロジェクトの環境変数に格納し、Git リポジトリへ含めない。
- ローカル開発でもクラウド上の開発専用 Supabase プロジェクトへ接続し、CLI の `supabase link` を用いてマイグレーションを同期する。クラウド UI の運用に慣れることと環境構築工数の削減が理由。
