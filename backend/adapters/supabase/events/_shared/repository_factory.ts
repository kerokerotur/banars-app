import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseEventRepository } from "../repositories/event_repository.ts"
import { SupabaseEventPlaceRepository } from "../repositories/event_place_repository.ts"
import { SupabaseEventTypeRepository } from "../repositories/event_type_repository.ts"
import { SupabasePlaceManagementRepository } from "../repositories/place_management_repository.ts"
import { SupabaseEventListRepository } from "../repositories/event_list_repository.ts"
import { SupabaseEventAttendanceRepository } from "../repositories/event_attendance_repository.ts"

/**
 * Supabaseイベント関連のリポジトリファクトリー
 */
export class EventRepositoryFactory {
  constructor(private readonly client: SupabaseClient) {}

  createEventRepository() {
    return new SupabaseEventRepository(this.client)
  }

  createEventPlaceRepository() {
    return new SupabaseEventPlaceRepository(this.client)
  }

  createEventTypeRepository() {
    return new SupabaseEventTypeRepository(this.client)
  }

  createPlaceManagementRepository() {
    return new SupabasePlaceManagementRepository(this.client)
  }

  createEventListRepository() {
    return new SupabaseEventListRepository(this.client)
  }

  createEventAttendanceRepository() {
    return new SupabaseEventAttendanceRepository(this.client)
  }

  /**
   * すべてのリポジトリを一括生成
   */
  createAll() {
    return {
      eventRepository: this.createEventRepository(),
      eventPlaceRepository: this.createEventPlaceRepository(),
      eventTypeRepository: this.createEventTypeRepository(),
      placeManagementRepository: this.createPlaceManagementRepository(),
      eventListRepository: this.createEventListRepository(),
      eventAttendanceRepository: this.createEventAttendanceRepository(),
    }
  }
}
