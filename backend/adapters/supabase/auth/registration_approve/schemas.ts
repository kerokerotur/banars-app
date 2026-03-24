import { z } from "zod"

export const registrationApproveRequestSchema = z.object({
  applicationId: z.string().uuid(),
})

export type RegistrationApproveRequest = z.infer<
  typeof registrationApproveRequestSchema
>
