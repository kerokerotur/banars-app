import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user";

/**
 * Edge Function から返されるドメインエラー
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * FunctionsHttpError のレスポンスボディを展開して ApiError を投げるユーティリティ
 */
async function throwApiError(error: unknown): Promise<never> {
  if (
    error instanceof Error &&
    error.name === "FunctionsHttpError" &&
    "context" in error &&
    error.context instanceof Response
  ) {
    try {
      const body = await error.context.json();
      throw new ApiError(
        body.code ?? "unknown",
        body.message ?? error.message,
      );
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
  }
  throw error;
}

/**
 * LINEログイン（既存ユーザー向け）
 */
export const loginWithLine = async (idToken: string) => {
  const { data, error } = await supabase.functions.invoke("line_login", {
    body: { idToken },
  });

  if (error) await throwApiError(error);
  return data;
};

/**
 * 初回登録（招待リンク経由の新規ユーザー向け）
 */
export const initialSignup = async (params: {
  inviteToken: string;
  idToken: string;
  lineProfile: {
    lineUserId: string;
    displayName: string;
    avatarUrl?: string;
  };
}) => {
  const { data, error } = await supabase.functions.invoke("initial_signup", {
    body: {
      inviteToken: params.inviteToken,
      lineTokens: { idToken: params.idToken },
      lineProfile: params.lineProfile,
    },
  });

  if (error) throw error;
  return data;
};

/**
 * セッショントークンを使ってSupabase認証セッションを確立
 */
export const exchangeSessionToken = async (sessionToken: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: sessionToken,
    type: "magiclink",
  });

  if (error) throw error;
  return data;
};

/**
 * ログインユーザー情報を取得（get_me Edge Function）
 */
export const getMe = async (): Promise<UserProfile> => {
  const { data, error } = await supabase.functions.invoke("get_me", {
    method: "GET",
  });

  if (error) throw error;

  return {
    userId: data.userId ?? "",
    displayName: data.displayName ?? "名前未設定",
    avatarUrl: data.avatarUrl ?? null,
    role: data.role ?? null,
  };
};
