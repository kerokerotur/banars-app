# web

banars の Web クライアントです。

## セットアップ

1. `cd apps/web`
2. `npm install`
3. `npm run dev`

## 環境変数

Vite の環境変数は `VITE_` プレフィックスで管理します。

例:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_LINE_LIFF_ID`

## デプロイ (Cloudflare Pages)

GitHub Actions でビルド〜Cloudflare Pages へのデプロイを行う。`.github/workflows/deploy-web.yml` を参照。

### トリガー

- `main` への push（`apps/web/**` または当該ワークフローファイルの変更時）
- 手動: Actions タブから「Deploy Web (Cloudflare Pages)」の Run workflow

### 必要な GitHub リポジトリシークレット

| シークレット名 | 説明 |
|---------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン（Account > API Tokens > Cloudflare Pages > Edit） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID（ダッシュボード右サイドの API セクション） |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | （任意）Cloudflare Pages のプロジェクト名。未設定時は `banars-web` |

本番ビルドで環境変数を埋め込む場合は、`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_LINE_LIFF_ID` をシークレットに登録し、ワークフローの Build ステップの `env` を有効化すること。
