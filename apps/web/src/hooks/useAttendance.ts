import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerAttendance,
  getAttendanceSummary,
} from "@/services/attendance.service";
import type { RegisterAttendanceInput } from "@/types/attendance";

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
 * 出欠登録・更新
 */
export const useRegisterAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterAttendanceInput) => registerAttendance(input),
    onSuccess: (_data, variables) => {
      // イベント一覧のキャッシュを無効化（出欠状態が変わるため）
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      // イベント詳細のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", variables.eventId],
      });
      // 出欠サマリーのキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["attendance", "summary", variables.eventId],
      });
    },
  });
};
