import { z } from "zod"

/**
 * invite_issue APIのリクエストボディスキーマ
 * 詳細なバリデーションはドメイン層のExpiresInDaysクラスで実施
 */
export const inviteIssueRequestSchema = z.object({
  expiresInDays: z.number().int().optional(),
})

export type InviteIssueRequest = z.infer<typeof inviteIssueRequestSchema>
