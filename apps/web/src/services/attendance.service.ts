import { supabase } from "@/lib/supabase";
import type {
  RegisterAttendanceInput,
  AttendanceSummaryBatchItem,
  EventAttendanceDetail,
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
 * イベントの出欠詳細一覧を取得（event_detail API、モバイルアプリと同じロジック）
 * GET リクエストなのでクエリパラメータはURL に含める（Fetch API は GET + body を許可しない）
 */
export const getEventAttendance = async (
  eventId: string
): Promise<EventAttendanceDetail[]> => {
  const params = new URLSearchParams({ event_id: eventId });
  const { data, error } = await supabase.functions.invoke(
    `event_detail?${params}`,
    { method: "GET" }
  );

  if (error) throw error;
  return (data.attendance ?? []) as EventAttendanceDetail[];
};

/**
 * 複数イベントの出欠サマリーを一括取得（モバイルアプリと同じパターン）
 */
export const getAttendanceSummariesBatch = async (
  eventIds: string[]
): Promise<Record<string, AttendanceSummaryBatchItem[]>> => {
  if (eventIds.length === 0) return {};

  const params = new URLSearchParams({ event_ids: eventIds.join(",") });
  const { data, error } = await supabase.functions.invoke(
    `event_attendances_summary?${params}`,
    { method: "GET" }
  );

  if (error) throw error;
  return (data.attendances ?? {}) as Record<string, AttendanceSummaryBatchItem[]>;
};
