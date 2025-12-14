import { createSearchPlacesHandler } from "@adapters/supabase/events/search_places/handler.ts"

const app = createSearchPlacesHandler({
  supabaseUrl: requireEnv("SUPABASE_URL"),
  serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  nominatimEndpoint:
    Deno.env.get("NOMINATIM_ENDPOINT") ??
    "https://nominatim.openstreetmap.org/search",
  nominatimUserAgent:
    Deno.env.get("NOMINATIM_USER_AGENT") ??
    "banars-app/1.0 (contact@banars.example)",
})

Deno.serve(app.fetch)

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}
