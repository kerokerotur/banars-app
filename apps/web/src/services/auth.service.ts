import { supabase } from "@/lib/supabase";

/**
 * LINEログイン（既存ユーザー向け）
 */
export const loginWithLine = async (idToken: string) => {
  const { data, error } = await supabase.functions.invoke("line_login", {
    body: { idToken },
  });

  if (error) throw error;
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
 * ログインユーザー情報を取得
 */
export const getMe = async () => {
  const { data, error } = await supabase.functions.invoke("get_me", {
    method: "GET",
  });

  if (error) throw error;
  return data;
};
