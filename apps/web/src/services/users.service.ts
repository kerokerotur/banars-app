import { supabase } from "@/lib/supabase";
import type { UserListItem } from "@/types/user";

/**
 * メンバー一覧を取得
 */
export const getUserList = async (): Promise<UserListItem[]> => {
  const { data, error } = await supabase.functions.invoke("user_list", {
    method: "GET",
  });

  if (error) throw error;
  return data.users as UserListItem[];
};
