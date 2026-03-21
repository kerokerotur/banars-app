import { useMemo } from "react";
import { X, User } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useEventAttendance } from "@/hooks/useAttendance";
import type { EventAttendanceDetail } from "@/types/attendance";

interface AttendanceListModalProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

const UserCard = ({ attendance }: { attendance: EventAttendanceDetail }) => (
  <div className="flex items-center gap-3 bg-light-surface dark:bg-dark-surface rounded-xl p-3">
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-light/30 flex-shrink-0">
      {attendance.avatarUrl ? (
        <img
          src={attendance.avatarUrl}
          alt={attendance.displayName ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-primary-light/20 flex items-center justify-center">
          <User size={24} className="text-primary" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">
        {attendance.displayName ?? attendance.memberId}
      </p>
      {attendance.comment && (
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
          {attendance.comment}
        </p>
      )}
    </div>
  </div>
);

interface SectionProps {
  label: string;
  attendances: EventAttendanceDetail[];
  borderColor: string;
  badgeClass: string;
}

const Section = ({ label, attendances, borderColor, badgeClass }: SectionProps) => {
  if (attendances.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1 h-5 rounded-full ${borderColor}`} />
        <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
          {label}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {attendances.length}名
        </span>
      </div>
      <div className="space-y-2">
        {attendances.map((a) => (
          <UserCard key={a.id} attendance={a} />
        ))}
      </div>
    </div>
  );
};

export const AttendanceListModal = ({
  eventId,
  eventTitle,
  onClose,
}: AttendanceListModalProps) => {
  const { data: attendanceList, isLoading, error } = useEventAttendance(eventId);

  const grouped = useMemo(() => {
    if (!attendanceList) return null;
    return {
      attending: attendanceList.filter((a) => a.status === "attending"),
      pending: attendanceList.filter((a) => a.status === "pending"),
      notAttending: attendanceList.filter((a) => a.status === "not_attending"),
    };
  }, [attendanceList]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-light-background dark:bg-dark-background rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
              出欠一覧
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
            {eventTitle}
          </p>
        </div>

        <div className="h-px bg-light-divider dark:bg-dark-divider flex-shrink-0" />

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">出欠情報の読み込みに失敗しました</p>
            </div>
          )}

          {grouped && (
            <>
              {/* サマリーカード */}
              <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-sm">
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-status-attending-text">
                      {grouped.attending.length}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      出席
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-status-pending-text">
                      {grouped.pending.length}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      保留
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-status-absent-text">
                      {grouped.notAttending.length}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      欠席
                    </p>
                  </div>
                </div>
              </div>

              {/* セクション */}
              <Section
                label="出席"
                attendances={grouped.attending}
                borderColor="bg-status-attending-text"
                badgeClass="bg-status-attending-bg text-status-attending-text"
              />
              <Section
                label="保留"
                attendances={grouped.pending}
                borderColor="bg-status-pending-text"
                badgeClass="bg-status-pending-bg text-status-pending-text"
              />
              <Section
                label="欠席"
                attendances={grouped.notAttending}
                borderColor="bg-status-absent-text"
                badgeClass="bg-status-absent-bg text-status-absent-text"
              />

              {grouped.attending.length === 0 &&
                grouped.pending.length === 0 &&
                grouped.notAttending.length === 0 && (
                  <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-4">
                    まだ回答がありません
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
