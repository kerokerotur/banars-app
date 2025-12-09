/**
 * LINE User ID からSupabase用メールアドレスを派生させる
 * @param lineUserId LINE User ID（sub クレーム）
 * @param claimedEmail LINE ID Token に含まれるメールアドレス（オプショナル）
 * @returns Supabase Auth 用のメールアドレス
 */
export function deriveSupabaseEmail(
  lineUserId: string,
  claimedEmail: string | null,
): string {
  if (claimedEmail && isValidEmail(claimedEmail)) {
    return claimedEmail.toLowerCase()
  }
  const normalizedId = lineUserId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  return `line_${normalizedId}@line.local`
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

