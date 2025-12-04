import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js"

import {
  InitialSignupError,
  type InitialSignupErrorCode,
  prepareInitialSignupContext,
} from "../../../../core/auth/usecases/initial_signup/domain.ts"

const JSON_HEADERS = { "Content-Type": "application/json" }

export interface InitialSignupHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  lineChannelId: string
  lineJwksUrl: string
}

export function createInitialSignupHandler(
  deps: InitialSignupHandlerDeps,
): (req: Request) => Promise<Response> {
  const adminClient = createClient(deps.supabaseUrl, deps.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return async function handler(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          code: "method_not_allowed",
          message: "POST のみサポートしています。",
        }),
        { status: 405, headers: JSON_HEADERS },
      )
    }

    let body: unknown
    try {
      body = await req.json()
    } catch (_) {
      return jsonError(
        new InitialSignupError(
          "invalid_request",
          "JSON ボディを解析できませんでした。",
          400,
        ),
      )
    }

    let context
    try {
      context = await prepareInitialSignupContext(body, {
        lineChannelId: deps.lineChannelId,
        lineJwksUrl: deps.lineJwksUrl,
      })
    } catch (error) {
      return handleError(error)
    }

    try {
      await assertInviteTokenValid(adminClient, context.inviteTokenHash)

      const existingUser = await findUserByLineId(adminClient, context.lineUserId)
      if (existingUser) {
        return jsonResponse({
          userId: existingUser.id,
          sessionTransferToken: null,
        })
      }

      const supabaseEmail = deriveSupabaseEmail(
        context.lineUserId,
        context.email,
      )

      const authUserId = await createSupabaseAuthUser(adminClient, {
        email: supabaseEmail,
        lineUserId: context.lineUserId,
        displayName: context.lineDisplayName,
        avatarUrl: context.avatarUrl,
      })

      await upsertUserRecord(adminClient, {
        id: authUserId,
        line_user_id: context.lineUserId,
        status: "active",
      })

      await upsertUserDetail(adminClient, {
        user_id: authUserId,
        display_name: context.lineDisplayName,
        avatar_url: context.avatarUrl,
        synced_datetime: new Date().toISOString(),
      })

      const sessionTransferToken = await issueSessionTransferToken(
        adminClient,
        supabaseEmail,
      )

      return jsonResponse({
        userId: authUserId,
        sessionTransferToken,
      })
    } catch (error) {
      return handleError(error)
    }
  }
}

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

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  })
}

function jsonError(error: InitialSignupError) {
  return new Response(
    JSON.stringify({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    }),
    { status: error.status, headers: JSON_HEADERS },
  )
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

function handleError(error: unknown) {
  if (error instanceof InitialSignupError) {
    return jsonError(error)
  }
  console.error("[initial_signup] unexpected error", error)
  return jsonError(
    new InitialSignupError(
      "internal_error",
      "内部エラーが発生しました。",
      500,
    ),
  )
}
