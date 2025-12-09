import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IUserDetailRepository,
  UserDetail,
  UpsertUserDetailParams,
} from "@core/auth/domain/irepository/user_detail_repository.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "@core/auth/domain/errors/initial_signup_error.ts"

/**
 * Supabase実装のユーザー詳細リポジトリ
 */
export class SupabaseUserDetailRepository implements IUserDetailRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findByUserId(userId: string): Promise<UserDetail | null> {
    const { data, error } = await this.client
      .from("user_detail")
      .select("user_id, display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "ユーザー詳細の検索に失敗しました。",
      )
    }

    if (!data) {
      return null
    }

    return {
      userId: data.user_id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
    }
  }

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
