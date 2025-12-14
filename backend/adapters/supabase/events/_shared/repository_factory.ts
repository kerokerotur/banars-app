import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseEventRepository } from "../repositories/event_repository.ts"
import { SupabaseEventPlaceRepository } from "../repositories/event_place_repository.ts"
import { SupabaseEventTypeRepository } from "../repositories/event_type_repository.ts"

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

  /**
   * すべてのリポジトリを一括生成
   */
  createAll() {
    return {
      eventRepository: this.createEventRepository(),
      eventPlaceRepository: this.createEventPlaceRepository(),
      eventTypeRepository: this.createEventTypeRepository(),
    }
  }
}
