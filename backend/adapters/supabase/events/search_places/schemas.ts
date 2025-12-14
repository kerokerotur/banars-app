import { z } from "zod"

/**
 * place検索APIのリクエストスキーマ
 */
export const searchPlacesRequestSchema = z.object({
  query: z.string().min(1, "query is required"),
  limit: z.number().int().positive().max(10).optional(),
  countryCodes: z.array(z.string().min(2).max(2)).optional(),
})
