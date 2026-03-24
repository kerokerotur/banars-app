import { z } from "zod"

export const registrationRejectRequestSchema = z.object({
  applicationId: z.string().uuid(),
})

export type RegistrationRejectRequest = z.infer<
  typeof registrationRejectRequestSchema
>
