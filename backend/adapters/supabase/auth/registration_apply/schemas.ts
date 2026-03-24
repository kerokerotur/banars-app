import { z } from "zod"

export const registrationApplyRequestSchema = z.object({
  idToken: z.string().min(1),
})

export type RegistrationApplyRequest = z.infer<
  typeof registrationApplyRequestSchema
>
