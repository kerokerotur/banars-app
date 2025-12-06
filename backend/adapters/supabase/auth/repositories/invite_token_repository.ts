import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  IInviteTokenRepository,
  InsertInviteTokenParams,
  InviteToken,
} from "@core/auth/domain/irepository/invite_token_repository.ts"
import { InitialSignupError } from "@core/auth/domain/errors/initial_signup_error.ts"
import { InviteIssueError } from "@core/auth/domain/errors/invite_issue_error.ts"

/**
 * Supabase実装の招待トークンリポジトリ
 */
export class SupabaseInviteTokenRepository implements IInviteTokenRepository {
  constructor(private readonly client: SupabaseClient) {}

  async insert(params: InsertInviteTokenParams): Promise<void> {
    const { error } = await this.client.from("invite_token").insert({
      token_hash: params.tokenHash,
      expires_datetime: params.expiresDatetime.toISOString(),
      issued_by: params.issuedBy,
      created_user: params.createdUser,
    })

    if (error) {
      throw new InviteIssueError(
        "internal_error",
        "招待トークンの保存に失敗しました。",
        500,
        { reason: error.message },
      )
    }
  }

  async findByHashAndValidate(tokenHash: string): Promise<InviteToken> {
    const { data, error } = await this.client
      .from("invite_token")
      .select("token_hash, expires_datetime")
      .eq("token_hash", tokenHash)
      .maybeSingle()

    if (error) {
      throw new InitialSignupError(
        "internal_error",
        "招待トークンの検証に失敗しました。",
        500,
        { reason: error.message },
      )
    }

    if (!data) {
      throw new InitialSignupError(
        "token_not_found",
        "招待トークンが見つかりません。",
        404,
      )
    }

    const expiresAt = new Date(data.expires_datetime)
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new InitialSignupError(
        "token_expired",
        "招待トークンの有効期限が切れています。",
        410,
      )
    }

    return {
      tokenHash: data.token_hash,
      expiresDatetime: expiresAt,
    }
  }
}
