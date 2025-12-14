import { createEventCreateHandler } from "@adapters/supabase/events/event_create/handler.ts"

const app = createEventCreateHandler({
  supabaseUrl: requireEnv("SUPABASE_URL"),
  serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
})

Deno.serve(app.fetch)

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}
