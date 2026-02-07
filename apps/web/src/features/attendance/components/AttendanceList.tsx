import { useAttendanceSummary } from "@/hooks/useAttendance";
import type { AttendanceSummaryUser } from "@/types/attendance";

interface AttendanceListProps {
  eventId: string;
}

const UserItem = ({ user }: { user: AttendanceSummaryUser }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-divider dark:border-dark-divider">
      {/* アバター */}
      <div className="w-10 h-10 rounded-full bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            👤
          </span>
        )}
      </div>

      {/* 名前とコメント */}
      <div className="flex-1 min-w-0">
        <p className="text-light-text-primary dark:text-dark-text-primary font-medium">
          {user.displayName}
        </p>
        {user.comment && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {user.comment}
          </p>
        )}
      </div>
    </div>
  );
};

export const AttendanceList = ({ eventId }: AttendanceListProps) => {
  const { data: summary, isLoading, error } = useAttendanceSummary(eventId);

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

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 参加 */}
      {summary.attending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-attending-bg text-status-attending-text rounded text-xs">
              参加 {summary.attending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {summary.attending.map((user) => (
              <UserItem key={user.userId} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* 欠席 */}
      {summary.notAttending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-absent-bg text-status-absent-text rounded text-xs">
              欠席 {summary.notAttending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {summary.notAttending.map((user) => (
              <UserItem key={user.userId} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* 保留 */}
      {summary.pending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-pending-bg text-status-pending-text rounded text-xs">
              保留 {summary.pending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {summary.pending.map((user) => (
              <UserItem key={user.userId} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* 未回答 */}
      {summary.unanswered.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-status-unanswered-bg text-status-unanswered-text rounded text-xs">
              未回答 {summary.unanswered.length}
            </span>
          </h3>
          <div className="space-y-2">
            {summary.unanswered.map((user) => (
              <UserItem key={user.userId} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
