import { z } from "zod"

const DEFAULT_EXPIRES_IN_DAYS = 7
const MIN_EXPIRES_IN_DAYS = 1
const MAX_EXPIRES_IN_DAYS = 30

/**
 * invite_issue APIのリクエストボディスキーマ
 */
export const inviteIssueRequestSchema = z.object({
  expiresInDays: z
    .number()
    .int("expiresInDays は整数で指定してください")
    .min(
      MIN_EXPIRES_IN_DAYS,
      `expiresInDays は ${MIN_EXPIRES_IN_DAYS} 以上で指定してください`,
    )
    .max(
      MAX_EXPIRES_IN_DAYS,
      `expiresInDays は ${MAX_EXPIRES_IN_DAYS} 以下で指定してください`,
    )
    .default(DEFAULT_EXPIRES_IN_DAYS)
    .optional(),
})

export type InviteIssueRequest = z.infer<typeof inviteIssueRequestSchema>
