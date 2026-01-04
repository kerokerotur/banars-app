import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IOneSignalPlayerRepository,
  UpsertOneSignalPlayerParams,
} from "@core/auth/domain/irepository/onesignal_player_repository.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "@core/auth/domain/errors/initial_signup_error.ts"

/**
 * Supabase実装のOneSignal Player IDリポジトリ
 */
export class SupabaseOneSignalPlayerRepository
  implements IOneSignalPlayerRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async upsert(params: UpsertOneSignalPlayerParams): Promise<void> {
    const { data, error } = await this.client
      .from("onesignal_players")
      .upsert(
        {
          user_id: params.userId,
          player_id: params.playerId,
          is_active: true,
          updated_user: params.updatedUser ?? null,
        },
        {
          onConflict: "user_id,player_id",
        },
      )
      .select()
      .single()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "OneSignal Player IDの登録に失敗しました。",
      )
    }
  }

  async findActivePlayerIdsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("onesignal_players")
      .select("player_id")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "OneSignal Player IDの取得に失敗しました。",
      )
    }

    return data?.map((row) => row.player_id) ?? []
  }

  async deactivatePlayerId(userId: string, playerId: string): Promise<void> {
    const { error } = await this.client
      .from("onesignal_players")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("player_id", playerId)

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "OneSignal Player IDの無効化に失敗しました。",
      )
    }
  }

  private wrapPostgrestError(
    error: PostgrestError,
    code: InitialSignupErrorCode,
    message: string,
  ): InitialSignupError {
    return new InitialSignupError(
      code,
      message,
      500,
      { reason: error.message },
    )
  }
}

