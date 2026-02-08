import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventListItem } from "@/types/event";

interface EventListModalProps {
  selectedDate: Date;
  events: EventListItem[];
  onClose: () => void;
}

export const EventListModal = ({
  selectedDate,
  events,
  onClose,
}: EventListModalProps) => {
  // モーダル背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-light-surface dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden animate-slide-up">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-light-surface dark:bg-dark-surface border-b border-light-divider dark:border-dark-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
              {format(selectedDate, "M月d日(E)", { locale: ja })}のイベント
            </h2>
            <button
              onClick={onClose}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors p-1"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        </div>

        {/* イベント一覧 */}
        <div className="overflow-y-auto max-h-[calc(80vh-4rem)] px-6 py-4">
          {events.length === 0 ? (
            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
              この日のイベントはありません
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  onClick={onClose}
                  className="block bg-light-background dark:bg-dark-background rounded-lg p-4 border border-light-divider dark:border-dark-divider hover:border-primary transition-colors"
                >
                  {/* イベント種別 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 bg-light-surface-container dark:bg-dark-surface-container rounded text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      {event.eventTypeName}
                    </span>
                    {event.userAttendanceStatus && (
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                          event.userAttendanceStatus
                        )}`}
                      >
                        {getStatusLabel(event.userAttendanceStatus)}
                      </span>
                    )}
                  </div>

                  {/* タイトル */}
                  <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    {event.title}
                  </h3>

                  {/* 日時 */}
                  <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <span>📅</span>
                    <span>
                      {format(new Date(event.startDatetime), "M月d日(E) HH:mm", {
                        locale: ja,
                      })}
                    </span>
                  </div>

                  {/* 集合時刻 */}
                  {event.meetingDatetime && (
                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      <span>🕐</span>
                      <span>
                        集合: {format(new Date(event.meetingDatetime), "HH:mm")}
                      </span>
                    </div>
                  )}

                  {/* 会場 */}
                  {event.eventPlaceName && (
                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      <span>📍</span>
                      <span>{event.eventPlaceName}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ステータスバッジのクラス名を取得
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "attending":
      return "bg-status-attending-bg text-status-attending-text";
    case "not_attending":
      return "bg-status-absent-bg text-status-absent-text";
    case "pending":
      return "bg-status-pending-bg text-status-pending-text";
    default:
      return "bg-status-unanswered-bg text-status-unanswered-text";
  }
}

// ステータスラベルを取得
function getStatusLabel(status: string): string {
  switch (status) {
    case "attending":
      return "参加";
    case "not_attending":
      return "欠席";
    case "pending":
      return "保留";
    default:
      return "未回答";
  }
}
