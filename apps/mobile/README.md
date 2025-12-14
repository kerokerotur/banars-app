# mobile

banars 草野球チーム向け Flutter モバイルアプリです。Flutter CLI は derry スクリプトを介して必ず FVM 版を実行します。

## 開発セットアップ

1. FVM をインストールし、プロジェクトで指定している Flutter バージョンを取得します。
2. `cd apps/mobile` でこのディレクトリに移動します。
3. `fvm use` を実行してバージョンを切り替えます（初回のみダウンロードが走ります）。
4. 依存関係は `fvm dart run derry setup` で取得します。derry が `fvm flutter pub get` を実行します。

## 環境変数の設定

アプリの実行・ビルドには環境変数の設定が必要です。

1. `dart_defines.json.example` をコピーして `dart_defines.json` を作成します。
   ```bash
   cp dart_defines.json.example dart_defines.json
   ```
2. `dart_defines.json` を編集し、各値を設定します。

| 環境変数名 | 説明 |
|-----------|------|
| `SUPABASE_URL` | Supabase プロジェクトの URL |
| `SUPABASE_ANON_KEY` | Supabase の Anonymous Key |
| `LINE_CHANNEL_ID` | LINE Developers Console で発行した LINE Login のチャンネル ID |

> **注意**: `dart_defines.json` には機密情報が含まれるため `.gitignore` に登録されています。Git にコミットしないでください。

## derry スクリプト一覧

すべて `fvm dart run derry <script>` の形で実行してください。

- `setup`: `fvm flutter pub get`
- `analyze`: `fvm flutter analyze`
- `test`: `fvm flutter test`
- `run-dev`: `fvm flutter run`
- `build-apk`: `fvm flutter build apk --release`
- `build-ios`: `fvm flutter build ios --release`
- `clean`: `fvm flutter clean`

必要なコマンドは `apps/mobile/derry.yaml` に追加してください。Flutter コマンドを直接呼び出さず、常に derry 経由（=FVM 経由）で統一します。

## アーキテクチャ

MVVM パターン + Riverpod による状態管理を採用しています。

### ディレクトリ構成

```
lib/
├── main.dart           # エントリーポイント
├── config/             # 環境設定
├── shared/             # 共通コンポーネント
│   ├── providers/      # アプリ全体で使用する Provider
│   ├── theme/          # テーマ・カラー定義
│   └── widgets/        # 共通ウィジェット
└── <feature>/          # 機能単位のディレクトリ
    ├── *_state.dart    # 状態クラス（イミュータブル）
    ├── *_controller.dart # Notifier（ビジネスロジック）
    └── *_page.dart     # UI
```

### レイヤー構成

| レイヤー | ファイル | 役割 |
|---------|---------|------|
| **State** | `*_state.dart` | イミュータブルな状態クラス。`copyWith` で更新 |
| **Controller** | `*_controller.dart` | `Notifier<State>` を継承。ビジネスロジック・API 通信を担当 |
| **Page** | `*_page.dart` | `ConsumerWidget` / `ConsumerStatefulWidget` で UI を構築 |

### Riverpod の使用パターン

- Provider 定義: `NotifierProvider<Controller, State>`
- 状態監視: `ref.watch(provider)`
- メソッド呼び出し: `ref.read(provider.notifier).method()`
