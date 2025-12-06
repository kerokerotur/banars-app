# backend ディレクトリガイド

## 目的
- Supabase Edge Functions などのホスティング実装と、TypeScript 製の純粋なドメインロジックを分離する。
- core 層のテスト容易性を高め、アダプタ差し替え時にも再利用できるようにする。
- `docs/PRD.md` / `docs/DESIGN_DOCS/` で定義されたコンテキストとコード配置を 1:1 に揃える。

## トップレベル構成
- `core/`: 外部 SDK やランタイム API へ依存しないロジック群。ユースケース、ドメインサービス、リポジトリのインターフェースを集約する。
- `adapters/`: Supabase Edge Function など、具体的な I/O・インフラ依存を扱うアダプタ。core の `usecases` へ処理を委譲する。

## core/ のコンテキスト構造
- `auth/`
- `events/`
- `attendance/`
- `shared/` (横断ユーティリティ・共通エラークラス)

各コンテキスト配下では次のサブディレクトリを共通化する:

| ディレクトリ | 役割 |
| --- | --- |
| `usecases/` | アプリケーションサービス層。入力 DTO を受け取り、domain 層を組み合わせたユースケースを実装する。Edge Function からはここを import する。 |
| `domain/` | ドメイン層を集約するディレクトリ。entity、service、irepository、errors を含む。 |
| `domain/entity/` | ドメインエンティティ・値オブジェクトを定義。永続化フォーマットへ依存しない。 |
| `domain/service/` | ドメインサービスやポリシー計算。複数ユースケースから再利用するビジネスルールを配置。 |
| `domain/irepository/` | リポジトリや外部サービス呼び出しの抽象インターフェース。adapters 層で具象実装を持たせる。 |
| `domain/errors/` | コンテキスト固有のドメインエラークラスを配置。 |
| `__tests__/` | 各ユースケースやサービスのユニットテスト。外部 SDK をモックし、core のみで完結させる。 |
| `__mocks__/` | irepository やサービスを切り替えるテスト用モック群。 |

`shared/` ではコンテキスト横断で利用する `errors/`, `value_objects/`, `utils/` を管理する。新しい共通ルールを追加する際は、該当する DESIGN_DOCS の記述と README を同時に更新する。

## adapters/ の構成と責務
- `supabase/`: Supabase Edge Function 用アダプタ。`auth/`, `events/`, `attendance/` の各コンテキスト単位でフォルダを切り、さらに機能単位（例: `initial_signup/`）へ階層化する。
- `_shared/`: 複数ホスティングで共通になるミドルウェア、型定義等を集約する。

### Hono Web Framework の使用
アダプタ層では Hono (https://hono.dev) を使用してルーティング、バリデーション、ミドルウェアを実装する。

**主要な依存ライブラリ:**
- `hono`: Web フレームワーク本体
- `zod`: スキーマバリデーション
- `@hono/zod-validator`: Hono と Zod の統合

**共通ミドルウェア (`_shared/middleware/`):**
- `supabase.ts`: Supabase Admin Client を注入するミドルウェア
- `auth.ts`: JWT 検証とロール確認を行うミドルウェア
- `error.ts`: core 層のドメインエラーを HTTP レスポンスに変換するエラーハンドラ

各機能フォルダの基本構成（例: `supabase/auth/initial_signup/`）

| ディレクトリ / ファイル | 役割 |
| --- | --- |
| `handler.ts` | Hono アプリを作成し、ルーティング、ミドルウェア、core の usecase 呼び出しを実装。Supabase SDK・外部 API 呼び出しはここに閉じる。 |
| `schemas.ts` | Zod スキーマによるリクエストボディの型定義とバリデーション。 |
| `mappers/` | core DTO と外部フォーマットの変換（必要に応じて）。 |
| `__tests__/` | アダプタ単体の結合テスト。Supabase SDK をモックし、core の振る舞いとの差分を確認する。 |

アダプタからは core の `usecases` のみ import し、core 側へ Supabase SDK を逆流させない。`handler.ts` は Hono アプリを返す関数として実装し、infra 層からは `app.fetch` を `Deno.serve` に渡すだけの薄いエントリポイントとする。

## テスト実行 (Vite + Vitest)
- 依存インストール: `cd backend && npm install`
- 単発実行: `npm test` （`vitest run` を呼び出し、`core/` と `adapters/` 配下の `*.test.ts` / `*.spec.ts` を対象にする）
- 開発用ウォッチ: `npm run test:watch`
- `tsconfig.json` は `allowImportingTsExtensions` と DOM ランタイム型を有効化しているため、Deno 互換の `.ts` 拡張子付き import でも失敗しない。
- Node.js 18 以降（`fetch` / `Request` 標準実装を含む）が前提。`@supabase/supabase-js` などランタイム依存も npm 経由で解決される。

## 運用ルール
1. core 層からは Deno / Node ランタイム API や Supabase SDK を直接参照しない。必要があれば domain/irepository で抽象化して adapters 層に実装する。
2. コンテキストを新設・改修する場合、先に `docs/DESIGN_DOCS/overview.md` と各コンテキスト配下のドキュメントを更新し、コードの配置規約を揃える。
3. Edge Function を実装する際は、`usecases` フォルダ内にユースケースを追加し、adapters からユースケースを呼び出す構造を徹底する。
4. テストは core 配下で完結させ、外部依存を追加したい場合は必ずユーザーに確認した上で方針を更新する。
5. ドメイン層のファイルは `domain/entity/`、`domain/service/`、`domain/irepository/`、`domain/errors/` に適切に配置し、レイヤー間の依存関係を明確にする。
6. アダプタ層では Hono を使用し、ルーティング、ミドルウェア、バリデーション（Zod）を活用する。リクエストバリデーションは `schemas.ts` に Zod スキーマとして定義する。
7. 認証が必要なエンドポイントでは `authMiddleware()` を使用し、必要に応じて `requiredRole` オプションでロール検証を行う。
8. エラーハンドリングは `app.onError(errorHandler)` で一元化し、core 層のドメインエラーを適切な HTTP レスポンスに変換する。

この README にない運用ルールを追加・変更する場合は、本書と `AGENTS.md` をセットで更新し、次回以降のセッションで参照できるようにしてください。
