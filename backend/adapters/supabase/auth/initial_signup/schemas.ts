import { z } from "zod"

/**
 * initial_signup APIのリクエストボディスキーマ
 */
export const initialSignupRequestSchema = z.object({
  inviteToken: z.string().min(1, "inviteToken は必須です"),
  lineTokens: z.object({
    idToken: z.string().min(1, "lineTokens.idToken は必須です"),
    accessToken: z.string().min(1, "lineTokens.accessToken は必須です"),
  }),
  lineProfile: z.object({
    lineUserId: z.string().min(1, "lineProfile.lineUserId は必須です"),
    displayName: z.string().min(1, "lineProfile.displayName は必須です"),
    avatarUrl: z.string().nullable().optional(),
  }),
})

export type InitialSignupRequest = z.infer<typeof initialSignupRequestSchema>
