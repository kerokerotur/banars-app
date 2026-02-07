import { supabase } from "@/lib/supabase";
import type {
  RegisterAttendanceInput,
  AttendanceSummary,
} from "@/types/attendance";

/**
 * 出欠を登録・更新
 */
export const registerAttendance = async (
  input: RegisterAttendanceInput
): Promise<void> => {
  const { error } = await supabase.functions.invoke("attendance_register", {
    body: input,
  });

  if (error) throw error;
};

/**
 * イベントの出欠サマリーを取得
 */
export const getAttendanceSummary = async (
  eventId: string
): Promise<AttendanceSummary> => {
  const { data, error } = await supabase.functions.invoke(
    "event_attendances_summary",
    {
      method: "GET",
      body: { eventId },
    }
  );

  if (error) throw error;
  return data as AttendanceSummary;
};
