import { createRegistrationRejectHandler } from "@adapters/supabase/auth/registration_reject/handler.ts"

const app = createRegistrationRejectHandler({
  supabaseUrl: requireEnv("SUPABASE_URL"),
  serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  lineChannelAccessToken: requireEnv("LINE_CHANNEL_ACCESS_TOKEN"),
})

Deno.serve(app.fetch)

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}
