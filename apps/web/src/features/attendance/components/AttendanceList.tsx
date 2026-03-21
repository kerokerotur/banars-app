import { useMemo } from "react";
import { User } from "lucide-react";
import { useEventAttendance } from "@/hooks/useAttendance";
import type { EventAttendanceDetail } from "@/types/attendance";

interface AttendanceListProps {
  eventId: string;
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  attending: {
    label: "出席",
    className: "bg-status-attending-bg text-status-attending-text",
  },
  not_attending: {
    label: "欠席",
    className: "bg-status-absent-bg text-status-absent-text",
  },
  pending: {
    label: "保留",
    className: "bg-status-pending-bg text-status-pending-text",
  },
};

const UserItem = ({ attendance }: { attendance: EventAttendanceDetail }) => {
  const badge = BADGE_CONFIG[attendance.status];
  return (
    <div className="flex items-start gap-3 p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-divider dark:border-dark-divider">
      <div className="w-10 h-10 rounded-full bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
        {attendance.avatarUrl ? (
          <img
            src={attendance.avatarUrl}
            alt={attendance.displayName ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={18} className="text-light-text-secondary dark:text-dark-text-secondary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-light-text-primary dark:text-dark-text-primary font-medium">
          {attendance.displayName ?? attendance.memberId}
        </p>
        {attendance.comment && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {attendance.comment}
          </p>
        )}
      </div>
      {badge && (
        <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      )}
    </div>
  );
};

export const AttendanceList = ({ eventId }: AttendanceListProps) => {
  const { data: attendanceList, isLoading, error } = useEventAttendance(eventId);

  const grouped = useMemo(() => {
    if (!attendanceList) return null;
    return {
      attending: attendanceList.filter((a) => a.status === "attending"),
      notAttending: attendanceList.filter((a) => a.status === "not_attending"),
      pending: attendanceList.filter((a) => a.status === "pending"),
    };
  }, [attendanceList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">
          出欠情報の読み込みに失敗しました
        </p>
      </div>
    );
  }

  if (!grouped) return null;

  return (
    <div className="space-y-4">
      {grouped.attending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-attending-bg text-status-attending-text rounded text-xs">
              出席 {grouped.attending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {grouped.attending.map((a) => (
              <UserItem key={a.id} attendance={a} />
            ))}
          </div>
        </div>
      )}

      {grouped.notAttending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-absent-bg text-status-absent-text rounded text-xs">
              欠席 {grouped.notAttending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {grouped.notAttending.map((a) => (
              <UserItem key={a.id} attendance={a} />
            ))}
          </div>
        </div>
      )}

      {grouped.pending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-pending-bg text-status-pending-text rounded text-xs">
              保留 {grouped.pending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {grouped.pending.map((a) => (
              <UserItem key={a.id} attendance={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
