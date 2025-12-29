# 環境変数と環境別設定の仕組み

このドキュメントでは、本アプリケーションにおける環境変数の定義方法と、Android/iOSでの環境別設定（アプリアイコン、Firebase設定など）の仕組みについて説明します。

## 目次

- [環境変数と環境別設定の仕組み](#環境変数と環境別設定の仕組み)
  - [目次](#目次)
  - [環境変数の定義](#環境変数の定義)
    - [環境ファイルの場所](#環境ファイルの場所)
    - [環境変数の例](#環境変数の例)
  - [環境変数の読み込みフロー](#環境変数の読み込みフロー)
    - [1. Flutterコマンドでの起動](#1-flutterコマンドでの起動)
    - [2. Dartコードでの環境変数の参照](#2-dartコードでの環境変数の参照)
  - [Androidでの環境変数の組み込み](#androidでの環境変数の組み込み)
    - [ビルドプロセス](#ビルドプロセス)
  - [iOSでの環境変数の組み込み](#iosでの環境変数の組み込み)
    - [ビルドプロセス](#ビルドプロセス-1)
  - [環境別設定の管理](#環境別設定の管理)
    - [アプリアイコン](#アプリアイコン)
      - [設定ファイル](#設定ファイル)
      - [設定例（開発環境）](#設定例開発環境)
      - [アイコンの生成](#アイコンの生成)
      - [アイコン画像の配置場所](#アイコン画像の配置場所)
    - [Androidリソースファイル](#androidリソースファイル)
      - [ディレクトリ構造](#ディレクトリ構造)
      - [ビルド時のコピー処理](#ビルド時のコピー処理)
  - [まとめ](#まとめ)

## 環境変数の定義

環境変数は `env/` ディレクトリ配下の `.env` ファイルで定義されています。

### 環境ファイルの場所

- `env/dev.env` - 開発環境用
- `env/prod.env` - 本番環境用

### 環境変数の例

各環境ファイルには以下のような変数が定義されています：

```1:4:env/dev.env
FLAVOR=dev
APP_ID=com.github.kerokerotur.flutter.template
APP_NAME=(dev)アプリ名
```

- `FLAVOR`: 環境識別子（dev/stg/prod）
- `APP_ID`: アプリケーションID（パッケージ名/バンドルID）
- `APP_NAME`: アプリケーション名（表示名）

## 環境変数の読み込みフロー

### 1. Flutterコマンドでの起動

`derry.yaml` で定義されたスクリプトを使用してアプリを起動します：

```1:6:derry.yaml
# アプリ起動（開発環境用）
run-dev: flutter run --dart-define-from-file=env/dev.env
# アプリ起動（本番用）
run-prod: flutter run --dart-define-from-file=env/prod.env
```

`--dart-define-from-file` オプションにより、指定された `.env` ファイルの内容が `dart-defines` としてFlutterに渡されます。

### 2. Dartコードでの環境変数の参照

Dartコード内では `String.fromEnvironment()` を使用して環境変数を参照できます：

```1:3:lib/src/const/env.dart
class Env {
  static String get env => const String.fromEnvironment('ENV');
}
```

## Androidでの環境変数の組み込み

### ビルドプロセス

1. **dart-definesのデコード**
   
   `android/app/build.gradle` で、Flutterから渡された `dart-defines`（Base64エンコードされたカンマ区切りの文字列）をデコードして変数に格納します：

```11:20:android/app/build.gradle
def dartDefines = [:];
if (project.hasProperty('dart-defines')) {
    // カンマ区切りかつBase64でエンコードされている dart-defines をデコードして変数に格納します。
    dartDefines = dartDefines + project.property('dart-defines')
            .split(',')
            .collectEntries { entry ->
                def pair = new String(entry.decodeBase64(), 'UTF-8').split('=')
                pair.length == 2 ? [(pair.first()): pair.last()] : [:]
            }
}
```

2. **アプリケーションIDとアプリ名の設定**

   デコードされた環境変数を使用して、`applicationId` と `app_name` リソースを設定します：

```37:47:android/app/build.gradle
    defaultConfig {
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        // multiDexEnabled true
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        applicationId "${dartDefines.APP_ID}"
        resValue "string", "app_name", "${dartDefines.APP_NAME}"
    }
```

3. **環境別リソースファイルのコピー**

   `FLAVOR` 環境変数に基づいて、環境別のリソースファイルを `src/main/res` にコピーします：

```68:75:android/app/build.gradle
task copySources(type: Copy) {
    from "src/${dartDefines.FLAVOR}/res"
    into 'src/main/res'
}

tasks.whenTaskAdded { task ->
    task.dependsOn copySources
}
```

   これにより、`android/app/src/dev/res/`、`android/app/src/stg/res/`、`android/app/src/prod/res/` に配置された環境別のリソース（アプリアイコンなど）がビルド時に適切に使用されます。

## iOSでの環境変数の組み込み

### ビルドプロセス

1. **ビルド前スクリプトの実行**

   Xcodeのビルドスキームで、ビルド前に `extract_dart_defines.sh` スクリプトが実行されます：

```8:13:ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Run Script"
               scriptText = "# Type a script or drag a script file from your workspace to insert its path.&#10;${SRCROOT}/scripts/extract_dart_defines.sh&#10;">
```

2. **Dart-Definesのデコードとxcconfigファイルの生成**

   `ios/scripts/extract_dart_defines.sh` スクリプトが、`DART_DEFINES` 環境変数から環境変数をデコードし、`Dart-Defines.xcconfig` ファイルを生成します：

```1:24:ios/scripts/extract_dart_defines.sh
#!/bin/sh

# Dart defineを書き出すファイルパスを指定します。
# ここでは `Dart-Defines.xcconfig` というファイル名で作成することにします。
OUTPUT_FILE="${SRCROOT}/Flutter/Dart-Defines.xcconfig"
# Dart defineの中身を変更した時に古いプロパティが残らないように、初めにファイルを空にしています。
: > $OUTPUT_FILE

# この関数でDart defineをデコードします。
function decode_url() { echo "${*}" | base64 --decode; }

IFS=',' read -r -a define_items <<<"$DART_DEFINES"

for index in "${!define_items[@]}"
do
    item=$(decode_url "${define_items[$index]}")
    # Dartの定義にはFlutter側で自動定義された項目も含まれます。
    # しかし、それらの定義を書き出してしまうとエラーによりビルドができなくなるので、
    # flutterやFLUTTERで始まる項目は出力しないようにしています。
    lowercase_item=$(echo "$item" | tr '[:upper:]' '[:lower:]')
    if [[ $lowercase_item != flutter* ]]; then
        echo "$item" >> "$OUTPUT_FILE"
    fi
done
```

3. **xcconfigファイルの読み込み**

   `Debug.xcconfig` と `Release.xcconfig` で `Dart-Defines.xcconfig` をインクルードします：

```1:3:ios/Flutter/Debug.xcconfig
#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.debug.xcconfig"
#include "Generated.xcconfig"
#include "Dart-Defines.xcconfig"
```

4. **Info.plistでの環境変数の参照**

   `Info.plist` で `$(APP_NAME)` を使用してアプリ名を設定します：

```7:8:ios/Runner/Info.plist
		<key>CFBundleDisplayName</key>
		<string>$(APP_NAME)</string>
```

5. **Bundle IDの設定**

   Xcodeプロジェクトの設定で `PRODUCT_BUNDLE_IDENTIFIER` に `$(APP_ID)` が設定されており、環境変数から読み込まれます。

## 環境別設定の管理

### アプリアイコン

アプリアイコンは環境ごとに異なる画像を使用するように設定されています。

#### 設定ファイル

各環境用の設定ファイルが用意されています：

- `flutter_launcher_icons-dev.yaml` - 開発環境用
- `flutter_launcher_icons-prod.yaml` - 本番環境用

#### 設定例（開発環境）

```1:7:flutter_launcher_icons-dev.yaml
flutter_launcher_icons:
  ios: true
  image_path: "assets/images/icon/ios/dev/app_icon_dev.png"
  remove_alpha_ios: true
  android: true
  adaptive_icon_background: "assets/images/icon/android/dev/app_icon_background_dev.png"
  adaptive_icon_foreground: "assets/images/icon/android/dev/app_icon_foreground_dev.png"
```

#### アイコンの生成

`derry.yaml` で定義されたコマンドでアイコンを生成します：

```14:15:derry.yaml
# アプリアイコンの作成
gen-icon: flutter pub run flutter_launcher_icons:main
```

ただし、環境別にアイコンを生成する場合は、対応する設定ファイルを `pubspec.yaml` にコピーするか、直接コマンドで指定する必要があります。

#### アイコン画像の配置場所

- iOS: `assets/images/icon/ios/{環境}/app_icon*.png`
- Android: `assets/images/icon/android/{環境}/app_icon*.png`

### Androidリソースファイル

Androidでは、環境別のリソースファイルが `android/app/src/{FLAVOR}/res/` ディレクトリに配置されています。

#### ディレクトリ構造

```
android/app/src/
├── dev/res/          # 開発環境用リソース
│   ├── mipmap-*/    # アプリアイコン
│   └── drawable-*/  # アプリアイコン（adaptive icon用）
├── stg/res/         # ステージング環境用リソース
│   └── ...
└── prod/res/        # 本番環境用リソース
    └── ...
```

#### ビルド時のコピー処理

`build.gradle` の `copySources` タスクにより、ビルド時に `FLAVOR` 環境変数に基づいて適切なリソースディレクトリが `src/main/res` にコピーされます：

```68:75:android/app/build.gradle
task copySources(type: Copy) {
    from "src/${dartDefines.FLAVOR}/res"
    into 'src/main/res'
}

tasks.whenTaskAdded { task ->
    task.dependsOn copySources
}
```

これにより、環境ごとに異なるアプリアイコンやその他のリソースが使用されます。

## まとめ

本アプリケーションでは、以下の仕組みで環境変数と環境別設定を管理しています：

1. **環境変数の定義**: `env/` ディレクトリの `.env` ファイルで定義
2. **Flutterへの渡し方**: `--dart-define-from-file` オプションを使用
3. **Androidでの組み込み**: Gradleビルドスクリプトで `dart-defines` をデコードし、アプリ設定とリソースファイルのコピーに使用
4. **iOSでの組み込み**: ビルド前スクリプトで `DART_DEFINES` をデコードし、`xcconfig` ファイル経由で設定に反映
5. **環境別設定**: アプリアイコンとAndroidリソースファイルは環境ごとに分離されており、`FLAVOR` 環境変数に基づいて適切なものが使用される
