/**
 * 会場のフィンガープリントを生成する
 * 会場名と住所を小文字に変換してハッシュ化
 * 手入力の会場の重複検出に使用
 */
export async function generatePlaceFingerprint(
  name: string,
  address: string,
): Promise<string> {
  const input = `${name.toLowerCase()}:${address.toLowerCase()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}
