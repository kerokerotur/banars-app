import { z } from "zod"

export const registrationApplicationsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
})

export type RegistrationApplicationsQuery = z.infer<
  typeof registrationApplicationsQuerySchema
>
