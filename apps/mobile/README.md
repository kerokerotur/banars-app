# mobile

banars 草野球チーム向け Flutter モバイルアプリです。Flutter CLI は derry スクリプトを介して必ず FVM 版を実行します。

## 開発セットアップ

1. FVM をインストールし、プロジェクトで指定している Flutter バージョンを取得します。
2. `cd apps/mobile` でこのディレクトリに移動します。
3. `fvm use` を実行してバージョンを切り替えます（初回のみダウンロードが走ります）。
4. 依存関係は `fvm dart run derry setup` で取得します。derry が `fvm flutter pub get` を実行します。

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
