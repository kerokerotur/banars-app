import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  IRegistrationApplicationRepository,
  InsertRegistrationApplicationParams,
  RegistrationApplication,
} from "@core/auth/domain/irepository/registration_application_repository.ts"
import { RegistrationApplicationError } from "@core/auth/domain/errors/registration_application_error.ts"

export class SupabaseRegistrationApplicationRepository
  implements IRegistrationApplicationRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findPendingByLineUserId(
    lineUserId: string,
  ): Promise<RegistrationApplication | null> {
    const { data, error } = await this.client
      .from("registration_applications")
      .select("id, line_user_id, display_name, avatar_url, status, created_at")
      .eq("line_user_id", lineUserId)
      .eq("status", "pending")
      .maybeSingle()

    if (error) {
      throw new RegistrationApplicationError(
        "internal_error",
        "申請の検索に失敗しました。",
        500,
        { reason: error.message },
      )
    }

    if (!data) return null
    return this.toEntity(data)
  }

  async findById(id: string): Promise<RegistrationApplication | null> {
    const { data, error } = await this.client
      .from("registration_applications")
      .select("id, line_user_id, display_name, avatar_url, status, created_at")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new RegistrationApplicationError(
        "internal_error",
        "申請の取得に失敗しました。",
        500,
        { reason: error.message },
      )
    }

    if (!data) return null
    return this.toEntity(data)
  }

  async listByStatus(
    status: "pending" | "approved" | "rejected",
  ): Promise<RegistrationApplication[]> {
    const { data, error } = await this.client
      .from("registration_applications")
      .select("id, line_user_id, display_name, avatar_url, status, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      throw new RegistrationApplicationError(
        "internal_error",
        "申請一覧の取得に失敗しました。",
        500,
        { reason: error.message },
      )
    }

    return (data ?? []).map((row) => this.toEntity(row))
  }

  async insert(params: InsertRegistrationApplicationParams): Promise<string> {
    const { data, error } = await this.client
      .from("registration_applications")
      .insert({
        line_user_id: params.lineUserId,
        display_name: params.displayName,
        avatar_url: params.avatarUrl,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      throw new RegistrationApplicationError(
        "internal_error",
        "申請の登録に失敗しました。",
        500,
        { reason: error.message },
      )
    }

    return data.id
  }

  async updateStatus(
    id: string,
    status: "approved" | "rejected",
    updatedUser: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("registration_applications")
      .update({
        status,
        updated_user: updatedUser,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw new RegistrationApplicationError(
        "internal_error",
        "申請ステータスの更新に失敗しました。",
        500,
        { reason: error.message },
      )
    }
  }

  private toEntity(row: {
    id: string
    line_user_id: string
    display_name: string
    avatar_url: string | null
    status: string
    created_at: string
  }): RegistrationApplication {
    return {
      id: row.id,
      lineUserId: row.line_user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      status: row.status as "pending" | "approved" | "rejected",
      createdAt: new Date(row.created_at),
    }
  }
}
