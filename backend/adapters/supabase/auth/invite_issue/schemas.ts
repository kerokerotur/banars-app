import { z } from "zod"

/**
 * invite_issue APIのリクエストボディスキーマ
 * 詳細なバリデーションはドメイン層のExpirationPeriodDaysクラスで実施
 */
export const inviteIssueRequestSchema = z.object({
  expirationDays: z.number().int().optional(),
})

export type InviteIssueRequest = z.infer<typeof inviteIssueRequestSchema>
