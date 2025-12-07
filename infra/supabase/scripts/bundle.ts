/**
 * Edge Functions バンドルスクリプト
 *
 * 以下の処理を実行:
 * 1. functions/<name>/index.ts が存在し src/index.ts がない場合、自動的に src/ へ移動
 * 2. src/index.ts を esbuild でバンドルし dist/index.ts へ出力
 * 3. config.toml の entrypoint を dist/index.ts に自動修正
 */

import * as esbuild from "esbuild"
import * as fs from "node:fs"
import * as path from "node:path"
import * as TOML from "smol-toml"

// プロジェクトルートからの相対パス
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname)
const SUPABASE_DIR = path.resolve(SCRIPT_DIR, "..")
const FUNCTIONS_DIR = path.resolve(SUPABASE_DIR, "functions")
const CONFIG_PATH = path.resolve(SUPABASE_DIR, "config.toml")
const BACKEND_DIR = path.resolve(SUPABASE_DIR, "../../backend")

// 外部依存として扱うパッケージ（Deno ランタイムで解決）
const EXTERNAL_PACKAGES = [
  "@supabase/supabase-js",
  "jose",
  "hono",
  "hono/*",
  "zod",
  "@hono/zod-validator",
  "npm:*",
  "jsr:*",
]

/**
 * パスエイリアスを解決する esbuild プラグイン
 */
function createAliasPlugin(): esbuild.Plugin {
  return {
    name: "alias-resolver",
    setup(build) {
      // @core/ エイリアスを解決
      build.onResolve({ filter: /^@core\// }, (args) => {
        const resolved = args.path.replace(/^@core\//, `${BACKEND_DIR}/core/`)
        return { path: resolved }
      })

      // @adapters/ エイリアスを解決
      build.onResolve({ filter: /^@adapters\// }, (args) => {
        const resolved = args.path.replace(
          /^@adapters\//,
          `${BACKEND_DIR}/adapters/`
        )
        return { path: resolved }
      })
    },
  }
}

/**
 * functions/ 配下の関数ディレクトリを取得
 */
function getFunctionDirs(): string[] {
  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        !entry.name.startsWith("_")
    )
    .map((entry) => entry.name)
}

/**
 * index.ts を src/index.ts に移動（必要な場合）
 */
function migrateToSrcDir(functionName: string): void {
  const functionDir = path.join(FUNCTIONS_DIR, functionName)
  const indexPath = path.join(functionDir, "index.ts")
  const srcDir = path.join(functionDir, "src")
  const srcIndexPath = path.join(srcDir, "index.ts")

  // src/index.ts が既に存在する場合はスキップ
  if (fs.existsSync(srcIndexPath)) {
    return
  }

  // index.ts が存在しない場合はスキップ
  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  ${functionName}: index.ts が見つかりません`)
    return
  }

  // src/ ディレクトリを作成
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true })
  }

  // index.ts を src/ に移動
  fs.renameSync(indexPath, srcIndexPath)
  console.log(`📁 ${functionName}: index.ts → src/index.ts に移動しました`)
}

/**
 * 関数をバンドル
 */
async function bundleFunction(functionName: string): Promise<boolean> {
  const functionDir = path.join(FUNCTIONS_DIR, functionName)
  const srcIndexPath = path.join(functionDir, "src", "index.ts")
  const distDir = path.join(functionDir, "dist")
  const distIndexPath = path.join(distDir, "index.ts")

  // src/index.ts が存在しない場合はスキップ
  if (!fs.existsSync(srcIndexPath)) {
    console.log(`⚠️  ${functionName}: src/index.ts が見つかりません`)
    return false
  }

  // dist/ ディレクトリを作成
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  try {
    await esbuild.build({
      entryPoints: [srcIndexPath],
      bundle: true,
      outfile: distIndexPath,
      format: "esm",
      platform: "neutral",
      target: "esnext",
      external: EXTERNAL_PACKAGES,
      plugins: [createAliasPlugin()],
      // .ts 拡張子のインポートを解決
      resolveExtensions: [".ts", ".js"],
    })
    console.log(`✅ ${functionName}: バンドル完了 → dist/index.ts`)
    return true
  } catch (error) {
    console.error(`❌ ${functionName}: バンドル失敗`, error)
    return false
  }
}

/**
 * config.toml の entrypoint を更新
 */
function updateConfigToml(functionNames: string[]): void {
  const configContent = fs.readFileSync(CONFIG_PATH, "utf-8")
  const config = TOML.parse(configContent) as Record<string, unknown>

  let updated = false

  for (const functionName of functionNames) {
    const functionsConfig = config.functions as
      | Record<string, Record<string, unknown>>
      | undefined
    if (!functionsConfig || !functionsConfig[functionName]) {
      console.log(
        `⚠️  ${functionName}: config.toml に設定が見つかりません。supabase functions new を実行してください。`
      )
      continue
    }

    const expectedEntrypoint = `./functions/${functionName}/dist/index.ts`
    const currentEntrypoint = functionsConfig[functionName].entrypoint

    if (currentEntrypoint !== expectedEntrypoint) {
      functionsConfig[functionName].entrypoint = expectedEntrypoint
      updated = true
      console.log(
        `🔧 ${functionName}: entrypoint を ${expectedEntrypoint} に更新`
      )
    }
  }

  if (updated) {
    fs.writeFileSync(CONFIG_PATH, TOML.stringify(config))
    console.log("📝 config.toml を更新しました")
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log("🚀 Edge Functions バンドルを開始します...\n")

  const functionNames = getFunctionDirs()
  console.log(`📂 検出された関数: ${functionNames.join(", ")}\n`)

  // 1. index.ts を src/ に移動（必要な場合）
  console.log("--- ファイル構造の確認 ---")
  for (const name of functionNames) {
    migrateToSrcDir(name)
  }
  console.log()

  // 2. バンドル実行
  console.log("--- バンドル実行 ---")
  const bundledFunctions: string[] = []
  for (const name of functionNames) {
    const success = await bundleFunction(name)
    if (success) {
      bundledFunctions.push(name)
    }
  }
  console.log()

  // 3. config.toml を更新
  console.log("--- config.toml 更新 ---")
  updateConfigToml(bundledFunctions)
  console.log()

  console.log("✨ バンドル処理が完了しました")
}

main().catch((error) => {
  console.error("エラーが発生しました:", error)
  process.exit(1)
})

