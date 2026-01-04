import { createAttendanceRemindHandler } from "@adapters/supabase/attendance/attendance_remind/handler.ts"

const app = createAttendanceRemindHandler({
  supabaseUrl: requireEnv("SUPABASE_URL"),
  serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  onesignalRestApiKey: requireEnv("ONESIGNAL_REST_API_KEY"),
  onesignalAppId: requireEnv("ONESIGNAL_APP_ID"),
})

Deno.serve(app.fetch)

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}

