import type { SupabaseClient } from "@supabase/supabase-js"
import type { GetEventTypesUseCaseResponse } from "./types.ts"

/**
 * イベント種別一覧を取得する
 *
 * NOTE: このユースケースはシンプルなので、リポジトリ層を経由せず
 * 直接Supabaseクライアントを使用しています
 */
export async function executeGetEventTypesUseCase(
  supabaseClient: SupabaseClient,
): Promise<GetEventTypesUseCaseResponse> {
  const { data, error } = await supabaseClient
    .from("event_types")
    .select("id, name, display_order")
    .order("display_order")

  if (error) {
    throw new Error(`Failed to fetch event types: ${error.message}`)
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    displayOrder: row.display_order,
  }))
}
