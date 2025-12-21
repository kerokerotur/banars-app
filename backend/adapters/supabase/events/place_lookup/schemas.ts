import { z } from "zod"

export const placeLookupRequestSchema = z.object({
  google_maps_url: z
    .string()
    .url("正しいURL形式で入力してください")
    .startsWith("https://", "HTTPSで始まるURLを入力してください"),
})

export type PlaceLookupRequest = z.infer<typeof placeLookupRequestSchema>
