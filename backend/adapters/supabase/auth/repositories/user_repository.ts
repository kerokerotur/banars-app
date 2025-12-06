import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IUserRepository,
  User,
  UpsertUserParams,
} from "../../../../core/auth/domain/irepository/user_repository.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "../../../../core/auth/domain/errors/initial_signup_error.ts"

/**
 * Supabase実装のユーザーリポジトリ
 */
export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findByLineId(lineUserId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("user")
      .select("id, line_user_id, status")
      .eq("line_user_id", lineUserId)
      .maybeSingle()

    if (error) {
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "ユーザー検索に失敗しました。",
      )
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      lineUserId: data.line_user_id,
      status: data.status,
    }
  }

  async upsert(params: UpsertUserParams): Promise<void> {
    const { error } = await this.client
      .from("user")
      .upsert(
        {
          id: params.id,
          line_user_id: params.lineUserId,
          status: params.status,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new InitialSignupError(
          "already_registered",
          "すでに登録済みのユーザーとして検出されました。",
          409,
        )
      }
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "ユーザー情報の保存に失敗しました。",
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
