import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IUserDetailRepository,
  UpsertUserDetailParams,
} from "../../../../core/auth/domain/irepository/user_detail_repository.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "../../../../core/auth/domain/errors/initial_signup_error.ts"

/**
 * Supabase実装のユーザー詳細リポジトリ
 */
export class SupabaseUserDetailRepository implements IUserDetailRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsert(params: UpsertUserDetailParams): Promise<void> {
    const { error } = await this.client
      .from("user_detail")
      .upsert(
        {
          user_id: params.userId,
          display_name: params.displayName,
          avatar_url: params.avatarUrl,
          synced_datetime: params.syncedDatetime.toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("user_id")
      .single()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "ユーザー詳細の保存に失敗しました。",
      )
    }
  }

  private wrapPostgrestError(
    error: PostgrestError,
    code: InitialSignupErrorCode,
    message: string,
  ) {
    return new InitialSignupError(code, message, 500, {
      reason: error.message,
      details: error.details,
    })
  }
}
