import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerAttendance,
  getAttendanceSummary,
  getAttendanceSummariesBatch,
  getEventAttendance,
} from "@/services/attendance.service";
import type {
  RegisterAttendanceInput,
  AttendanceSummaryBatchItem,
  AttendanceCounts,
} from "@/types/attendance";

/**
 * 出欠サマリーを取得
 */
export const useAttendanceSummary = (eventId: string) => {
  return useQuery({
    queryKey: ["attendance", "summary", eventId],
    queryFn: () => getAttendanceSummary(eventId),
    enabled: !!eventId,
  });
};

/**
 * 複数イベントの出欠サマリーを一括取得
 */
export const useAttendanceSummariesBatch = (eventIds: string[]) => {
  return useQuery({
    queryKey: ["attendance", "summaries-batch", eventIds],
    queryFn: () => getAttendanceSummariesBatch(eventIds),
    enabled: eventIds.length > 0,
  });
};

/**
 * バッチサマリーからイベントごとの出欠カウントを計算
 */
export const computeAttendanceCounts = (
  items: AttendanceSummaryBatchItem[] | undefined
): AttendanceCounts => {
  if (!items) {
    return { attendingCount: 0, notAttendingCount: 0, pendingCount: 0, answeredCount: 0 };
  }
  const attendingCount = items.filter((i) => i.status === "attending").length;
  const notAttendingCount = items.filter((i) => i.status === "not_attending").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  return {
    attendingCount,
    notAttendingCount,
    pendingCount,
    answeredCount: attendingCount + notAttendingCount + pendingCount,
  };
};

/**
 * イベントの出欠詳細一覧を取得（event_detail API）
 */
export const useEventAttendance = (eventId: string) => {
  return useQuery({
    queryKey: ["attendance", "detail", eventId],
    queryFn: () => getEventAttendance(eventId),
    enabled: !!eventId,
  });
};

/**
 * 出欠登録・更新
 */
export const useRegisterAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterAttendanceInput) => registerAttendance(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", "summary", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", "detail", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", "summaries-batch"],
      });
    },
  });
};
