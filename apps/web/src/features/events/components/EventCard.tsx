import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Dumbbell,
  Tag,
  CalendarCheck,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
} from "lucide-react";
import type { EventListItem, EventListUserAttendanceStatus } from "@/types/event";
import type { AttendanceCounts } from "@/types/attendance";
import { formatDate } from "@/utils/date";
import { AttendanceListModal } from "@/features/attendance/components/AttendanceListModal";

interface EventCardProps {
  event: EventListItem;
  attendanceCounts?: AttendanceCounts;
  isLoadingAttendance?: boolean;
}

const getEventTypeIcon = (eventTypeName: string) => {
  if (eventTypeName.includes("試合")) return Trophy;
  if (eventTypeName.includes("練習")) return Dumbbell;
  return Tag;
};

const STATUS_CONFIG: Record<
  EventListUserAttendanceStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  participating: {
    label: "参加",
    icon: CheckCircle,
    className: "bg-status-attending-bg text-status-attending-text",
  },
  absent: {
    label: "欠席",
    icon: XCircle,
    className: "bg-status-absent-bg text-status-absent-text",
  },
  pending: {
    label: "保留",
    icon: MinusCircle,
    className: "bg-status-pending-bg text-status-pending-text",
  },
  unanswered: {
    label: "未回答",
    icon: HelpCircle,
    className: "bg-status-unanswered-bg text-status-unanswered-text",
  },
};

const getStatusConfig = (status: EventListUserAttendanceStatus) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.unanswered;

export const EventCard = ({
  event,
  attendanceCounts,
  isLoadingAttendance,
}: EventCardProps) => {
  const navigate = useNavigate();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const EventTypeIcon = getEventTypeIcon(event.eventTypeName);
  const statusConfig = getStatusConfig(event.userAttendanceStatus);
  const StatusIcon = statusConfig.icon;

  const answeredCount = attendanceCounts?.answeredCount ?? 0;
  const attendingCount = attendanceCounts?.attendingCount ?? 0;
  const notAttendingCount = attendanceCounts?.notAttendingCount ?? 0;
  const pendingCount = attendanceCounts?.pendingCount ?? 0;

  return (
    <>
      <div
        className="block bg-light-surface dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        onClick={() => navigate(`/events/${event.id}`, { state: { event } })}
      >
        <div className="flex">
          {/* 左カラーバー */}
          <div className="w-1.5 bg-primary shrink-0 rounded-l-xl" />

          <div className="flex-1 p-4 min-w-0">
            {/* タイトル行 */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <EventTypeIcon
                  size={20}
                  className="text-light-text-primary dark:text-dark-text-primary shrink-0"
                />
                <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                  {event.title}
                </h3>
              </div>
              <span
                className={`ml-3 shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
              >
                <StatusIcon size={13} />
                {statusConfig.label}
              </span>
            </div>

            {/* 情報行 */}
            <div className="space-y-1.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <div className="flex items-center gap-2">
                <CalendarCheck size={15} className="shrink-0" />
                <span>
                  集合日時:{" "}
                  {formatDate(event.meetingDatetime ?? event.startDatetime)}
                </span>
              </div>
              {event.eventPlaceName && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="shrink-0" />
                  <span className="truncate">{event.eventPlaceName}</span>
                </div>
              )}
              {event.responseDeadlineDatetime && (
                <div className="flex items-center gap-2">
                  <Clock size={15} className="shrink-0" />
                  <span>
                    回答期限: {formatDate(event.responseDeadlineDatetime)}
                  </span>
                </div>
              )}
            </div>

            {/* 区切り線 */}
            <div className="my-3 border-t border-light-divider dark:border-dark-divider" />

            {/* 回答状況行 */}
            {isLoadingAttendance ? (
              <div className="flex items-center gap-2">
                <Users
                  size={16}
                  className="text-light-text-secondary dark:text-dark-text-secondary shrink-0"
                />
                <div className="h-2 w-24 bg-light-divider dark:bg-dark-divider rounded animate-pulse" />
              </div>
            ) : (
              <button
                className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAttendanceModal(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <Users
                    size={16}
                    className="text-light-text-secondary dark:text-dark-text-secondary shrink-0"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      回答済み {answeredCount} 人
                    </p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      出席 {attendingCount} ・ 欠席 {notAttendingCount} ・ 保留{" "}
                      {pendingCount}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-light-text-secondary dark:text-dark-text-secondary shrink-0"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {showAttendanceModal && (
        <AttendanceListModal
          eventId={event.id}
          eventTitle={event.title}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
    </>
  );
};
