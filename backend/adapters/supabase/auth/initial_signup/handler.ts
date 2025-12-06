import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { executeInitialSignupUseCase } from "../../../../core/auth/usecases/initial_signup/index.ts"
import {
  InitialSignupError,
  type InitialSignupErrorCode,
} from "../../../../core/auth/domain/errors/initial_signup_error.ts"
import { supabaseMiddleware } from "../../../_shared/middleware/supabase.ts"
import { errorHandler } from "../../../_shared/middleware/error.ts"
import type { HonoVariables } from "../../../_shared/types/hono.ts"
import { initialSignupRequestSchema } from "./schemas.ts"

export interface InitialSignupHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createInitialSignupHandler(deps: InitialSignupHandlerDeps) {
  const app = new Hono<{ Variables: HonoVariables }>()

  // エラーハンドリング
  app.onError(errorHandler)

  // Supabaseクライアント注入
  app.use(
    "*",
    supabaseMiddleware({
      supabaseUrl: deps.supabaseUrl,
      serviceRoleKey: deps.serviceRoleKey,
    }),
  )

  // POSTエンドポイント
  app.post("/", zValidator("json", initialSignupRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const supabaseClient = c.get("supabaseClient")

    // ユースケース実行
    const context = await executeInitialSignupUseCase(
      {
        inviteToken: body.inviteToken,
        lineTokens: body.lineTokens,
        lineProfile: {
          lineUserId: body.lineProfile.lineUserId,
          displayName: body.lineProfile.displayName,
          avatarUrl: body.lineProfile.avatarUrl ?? null,
        },
      },
      {
        lineChannelId: deps.lineChannelId,
        lineJwksUrl: deps.lineJwksUrl,
      },
    )

    // 招待トークンの検証
    await assertInviteTokenValid(supabaseClient, context.inviteTokenHash)

    // 既存ユーザーチェック
    const existingUser = await findUserByLineId(
      supabaseClient,
      context.lineUserId,
    )
    if (existingUser) {
      return c.json({
        userId: existingUser.id,
        sessionTransferToken: null,
      })
    }

    // Supabase Emailの生成
    const supabaseEmail = deriveSupabaseEmail(
      context.lineUserId,
      context.email,
    )

    // Supabase Authユーザー作成
    const authUserId = await createSupabaseAuthUser(supabaseClient, {
      email: supabaseEmail,
      lineUserId: context.lineUserId,
      displayName: context.lineDisplayName,
      avatarUrl: context.avatarUrl,
    })

    // ユーザーレコード作成
    await upsertUserRecord(supabaseClient, {
      id: authUserId,
      line_user_id: context.lineUserId,
      status: "active",
    })

    // ユーザー詳細作成
    await upsertUserDetail(supabaseClient, {
      user_id: authUserId,
      display_name: context.lineDisplayName,
      avatar_url: context.avatarUrl,
      synced_datetime: new Date().toISOString(),
    })

    // セッショントークン発行
    const sessionTransferToken = await issueSessionTransferToken(
      supabaseClient,
      supabaseEmail,
    )

    return c.json({
      userId: authUserId,
      sessionTransferToken,
    })
  })

  return app
}

// ===== Helper Functions =====

async function assertInviteTokenValid(
  client: SupabaseClient,
  tokenHash: string,
): Promise<void> {
  const { data, error } = await client
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
}

async function findUserByLineId(
  client: SupabaseClient,
  lineUserId: string,
) {
  const { data, error } = await client
    .from("user")
    .select("id")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (error) {
    throw wrapPostgrestError(
      error,
      "internal_error",
      "ユーザー検索に失敗しました。",
    )
  }

  return data
}

async function createSupabaseAuthUser(
  client: SupabaseClient,
  params: {
    email: string
    lineUserId: string
    displayName: string
    avatarUrl: string | null
  },
): Promise<string> {
  const { data, error } = await client.auth.admin.createUser({
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

async function upsertUserRecord(
  client: SupabaseClient,
  row: {
    id: string
    line_user_id: string
    status: string
  },
): Promise<void> {
  const { error } = await client
    .from("user")
    .upsert(row, { onConflict: "id" })
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
    throw wrapPostgrestError(
      error,
      "internal_error",
      "ユーザー情報の保存に失敗しました。",
    )
  }
}

async function upsertUserDetail(
  client: SupabaseClient,
  row: {
    user_id: string
    display_name: string
    avatar_url: string | null
    synced_datetime: string
  },
): Promise<void> {
  const { error } = await client
    .from("user_detail")
    .upsert(row, { onConflict: "user_id" })
    .select("user_id")
    .single()

  if (error) {
    throw wrapPostgrestError(
      error,
      "internal_error",
      "ユーザー詳細の保存に失敗しました。",
    )
  }
}

async function issueSessionTransferToken(
  client: SupabaseClient,
  email: string,
): Promise<string> {
  const { data, error } = await client.auth.admin.generateLink({
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

function deriveSupabaseEmail(lineUserId: string, claimedEmail: string | null) {
  if (claimedEmail && isValidEmail(claimedEmail)) {
    return claimedEmail.toLowerCase()
  }
  const normalizedId = lineUserId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  return `line_${normalizedId}@line.local`
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function wrapPostgrestError(
  error: PostgrestError,
  code: InitialSignupErrorCode,
  message: string,
) {
  return new InitialSignupError(code, message, 500, {
    reason: error.message,
    details: error.details,
  })
}
