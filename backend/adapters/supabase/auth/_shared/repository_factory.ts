import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseInviteTokenRepository } from "../repositories/invite_token_repository.ts"
import { SupabaseUserRepository } from "../repositories/user_repository.ts"
import { SupabaseUserDetailRepository } from "../repositories/user_detail_repository.ts"
import { SupabaseOneSignalPlayerRepository } from "../repositories/onesignal_player_repository.ts"
import { SupabaseAuthService } from "../services/auth_service.ts"

/**
 * Supabase認証関連のリポジトリとサービスのファクトリー
 */
export class AuthRepositoryFactory {
  constructor(private readonly client: SupabaseClient) {}

  createInviteTokenRepository() {
    return new SupabaseInviteTokenRepository(this.client)
  }

  createUserRepository() {
    return new SupabaseUserRepository(this.client)
  }

  createUserDetailRepository() {
    return new SupabaseUserDetailRepository(this.client)
  }

  createAuthService() {
    return new SupabaseAuthService(this.client)
  }

  createOneSignalPlayerRepository() {
    return new SupabaseOneSignalPlayerRepository(this.client)
  }

  /**
   * すべてのリポジトリとサービスを一括生成
   */
  createAll() {
    return {
      inviteTokenRepository: this.createInviteTokenRepository(),
      userRepository: this.createUserRepository(),
      userDetailRepository: this.createUserDetailRepository(),
      authService: this.createAuthService(),
      onesignalPlayerRepository: this.createOneSignalPlayerRepository(),
    }
  }
}
