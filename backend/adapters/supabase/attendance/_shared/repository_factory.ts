import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseAttendanceRepository } from "../repositories/attendance_repository.ts"

export class AttendanceRepositoryFactory {
  constructor(private readonly client: SupabaseClient) {}

  createAttendanceRepository() {
    return new SupabaseAttendanceRepository(this.client)
  }

  createAll() {
    return {
      attendanceRepository: this.createAttendanceRepository(),
    }
  }
}
