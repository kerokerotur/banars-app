import { createHash } from "node:crypto"

/**
 * 会場のフィンガープリントを生成する
 * 会場名と住所を小文字に変換してハッシュ化
 * 手入力の会場の重複検出に使用
 */
export function generatePlaceFingerprint(
  name: string,
  address: string,
): string {
  const input = `${name.toLowerCase()}:${address.toLowerCase()}`
  return createHash("sha256").update(input).digest("hex")
}
