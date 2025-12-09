import { createLineLoginHandler } from "@adapters/supabase/auth/line_login/handler.ts"

const app = createLineLoginHandler({
  supabaseUrl: requireEnv("SUPABASE_URL"),
  serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  lineChannelId: requireEnv("LINE_CHANNEL_ID"),
  lineJwksUrl: Deno.env.get("LINE_JWKS_URL") ??
    "https://api.line.me/oauth2/v2.1/certs",
})

Deno.serve(app.fetch)

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}
