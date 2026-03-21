import { useMemo } from "react";
import { useEventList } from "@/hooks/useEvents";
import {
  useAttendanceSummariesBatch,
  computeAttendanceCounts,
} from "@/hooks/useAttendance";
import type { AttendanceCounts } from "@/types/attendance";
import { EventCard } from "../components/EventCard";

export const EventListPage = () => {
  const { data: events, isLoading, error, refetch } = useEventList();

  const eventIds = useMemo(
    () => (events ?? []).map((e) => e.id),
    [events]
  );

  const { data: summariesMap, isLoading: isLoadingSummaries } =
    useAttendanceSummariesBatch(eventIds);

  const countsMap = useMemo(() => {
    const map: Record<string, AttendanceCounts> = {};
    if (!summariesMap) return map;
    for (const [eventId, items] of Object.entries(summariesMap)) {
      map[eventId] = computeAttendanceCounts(items);
    }
    return map;
  }, [summariesMap]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            イベントを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              {error instanceof Error
                ? error.message
                : "イベントの読み込みに失敗しました"}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-light-text-primary dark:text-dark-text-primary font-medium mb-1">
            イベントがありません
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            下の＋ボタンからイベントを作成できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          attendanceCounts={countsMap[event.id]}
          isLoadingAttendance={isLoadingSummaries}
        />
      ))}
    </div>
  );
};
