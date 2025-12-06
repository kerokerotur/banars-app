import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  IAuthService,
  CreateAuthUserParams,
} from "../../../../core/auth/domain/service/iauth_service.ts"
import { InitialSignupError } from "../../../../core/auth/domain/errors/initial_signup_error.ts"

/**
 * Supabase Auth実装の認証サービス
 */
export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async createUser(params: CreateAuthUserParams): Promise<string> {
    const { data, error } = await this.client.auth.admin.createUser({
      email: params.email,
      email_confirm: true,
      user_metadata: {
        lineUserId: params.lineUserId,
        displayName: params.displayName,
        avatarUrl: params.avatarUrl,
        signupSource: "initial_signup",
      },
    })

    if (error) {
      throw new InitialSignupError(
        "internal_error",
        "Supabase Auth ユーザーの作成に失敗しました。",
        502,
        { reason: error.message },
      )
    }

    const userId = data.user?.id
    if (!userId) {
      throw new InitialSignupError(
        "internal_error",
        "作成したユーザー ID を取得できませんでした。",
        502,
      )
    }

    return userId
  }

  async generateSessionToken(email: string): Promise<string> {
    const { data, error } = await this.client.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (error) {
      throw new InitialSignupError(
        "internal_error",
        "セッショントークンの発行に失敗しました。",
        502,
        { reason: error.message },
      )
    }

    const token = data?.properties?.hashed_token ?? null
    if (!token) {
      throw new InitialSignupError(
        "internal_error",
        "セッショントークンを取得できませんでした。",
        502,
      )
    }

    return token
  }
}
