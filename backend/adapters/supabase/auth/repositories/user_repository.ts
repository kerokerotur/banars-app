import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  IUserRepository,
  User,
  UserWithLastLogin,
  UserWithDetail,
  UpsertUserParams,
} from "@core/auth/domain/irepository/user_repository.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "@core/auth/domain/errors/initial_signup_error.ts"

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

  async findById(userId: string): Promise<UserWithLastLogin | null> {
    const { data, error } = await this.client
      .from("user")
      .select("id, line_user_id, status, last_login_datetime")
      .eq("id", userId)
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
      lastLoginDatetime: data.last_login_datetime
        ? new Date(data.last_login_datetime)
        : null,
    }
  }

  async findAllActive(): Promise<UserWithDetail[]> {
    // 1. user_list_view から取得（user と user_detail が JOIN 済み）
    const { data, error } = await this.client
      .from("user_list_view")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true })

    if (error) {
      // エラーの詳細をログに出力
      console.error("[user_repository] Error fetching users from database:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw this.wrapPostgrestError(
        error,
        "internal_error",
        "ユーザー一覧の取得に失敗しました。",
      )
    }

    if (!data || data.length === 0) {
      return []
    }

    // 2. 全ユーザーのauth情報を一度に取得（エラーが発生しても処理を続行）
    const roleMap = new Map<string, string | null>()
    try {
      const { data: authData, error: authError } = await this.client.auth.admin.listUsers()

      if (authError) {
        // エラーログを出力するが、処理は続行（role情報なしでユーザー一覧を返す）
        console.warn(
          "[user_repository] Failed to fetch auth users for role mapping:",
          {
            message: authError.message,
            status: authError.status,
            name: authError.name,
          },
        )
      } else if (authData?.users) {
        for (const authUser of authData.users) {
          roleMap.set(
            authUser.id,
            authUser.app_metadata?.role ?? null,
          )
        }
      }
    } catch (error) {
      // 予期しないエラーが発生した場合も処理を続行
      console.error(
        "[user_repository] Unexpected error while fetching auth users:",
        error,
      )
    }

    // 3. マージして返却
    return data.map((row) => ({
      id: row.id,
      lineUserId: row.line_user_id,
      status: row.status,
      lastLoginDatetime: row.last_login_datetime
        ? new Date(row.last_login_datetime)
        : null,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      role: roleMap.get(row.id) ?? null,
      createdAt: new Date(row.created_at),
    }))
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
