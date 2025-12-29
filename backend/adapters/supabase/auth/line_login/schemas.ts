import { z } from "zod"

/**
 * line_login APIのリクエストボディスキーマ
 */
export const lineLoginRequestSchema = z.object({
  idToken: z.string().min(1, "idToken は必須です"),
})

export type LineLoginRequest = z.infer<typeof lineLoginRequestSchema>


