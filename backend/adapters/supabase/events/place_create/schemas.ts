import { z } from "zod"

/**
 * place_create APIのリクエストボディスキーマ
 */
export const placeCreateRequestSchema = z.object({
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

export type PlaceCreateRequest = z.infer<typeof placeCreateRequestSchema>
