import { z } from "zod"

/**
 * place_update APIのリクエストボディスキーマ
 */
export const placeUpdateRequestSchema = z.object({
  place_id: z.string().uuid("不正な場所IDです"),
  name: z
    .string()
    .min(1, "場所名は必須です")
    .max(120, "場所名は120文字以内で入力してください"),
  google_maps_url: z
    .string()
    .url("正しいURL形式で入力してください")
    .startsWith("https://", "HTTPSで始まるURLを入力してください")
    .refine(
      (url) =>
        url.includes("maps.app.goo.gl") || url.includes("google.com/maps"),
      { message: "Google Maps のURLを入力してください" },
    ),
})

export type PlaceUpdateRequest = z.infer<typeof placeUpdateRequestSchema>
