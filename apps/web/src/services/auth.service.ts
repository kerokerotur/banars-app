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
 * 新規登録申請
 */
export const registrationApply = async (idToken: string) => {
  const { data, error } = await supabase.functions.invoke(
    "registration_apply",
    { body: { idToken } },
  );

  if (error) await throwApiError(error);
  return data as { applicationId: string };
};

/**
 * 登録申請一覧を取得（manager のみ）
 */
export const getRegistrationApplications = async (
  status?: "pending" | "approved" | "rejected",
) => {
  const params = status ? `?status=${status}` : "";
  const { data, error } = await supabase.functions.invoke(
    `registration_applications${params}`,
    { method: "GET" },
  );

  if (error) await throwApiError(error);
  return data as {
    applications: {
      id: string;
      lineUserId: string;
      displayName: string;
      avatarUrl: string | null;
      status: "pending" | "approved" | "rejected";
      createdAt: string;
    }[];
  };
};

/**
 * 登録申請を承認（manager のみ）
 */
export const approveRegistrationApplication = async (applicationId: string) => {
  const { data, error } = await supabase.functions.invoke(
    "registration_approve",
    { body: { applicationId } },
  );

  if (error) await throwApiError(error);
  return data as { userId: string };
};

/**
 * 登録申請を拒否（manager のみ）
 */
export const rejectRegistrationApplication = async (applicationId: string) => {
  const { data, error } = await supabase.functions.invoke(
    "registration_reject",
    { body: { applicationId } },
  );

  if (error) await throwApiError(error);
  return data as { applicationId: string };
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
