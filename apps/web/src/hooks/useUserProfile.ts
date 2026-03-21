import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth.service";

/**
 * ログインユーザーのプロフィールを取得（get_me Edge Function 経由）
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: getMe,
  });
};
