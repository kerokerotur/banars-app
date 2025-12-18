import { z } from "zod"

/**
 * place_delete APIのリクエストボディスキーマ
 */
export const placeDeleteRequestSchema = z.object({
  place_id: z.string().uuid("不正な場所IDです"),
})

export type PlaceDeleteRequest = z.infer<typeof placeDeleteRequestSchema>
