import { Link } from "react-router-dom";
import type { EventListItem } from "@/types/event";
import { formatDate } from "@/utils/date";

interface EventCardProps {
  event: EventListItem;
}

const getStatusColor = (
  status: "attending" | "not_attending" | "pending" | null
): string => {
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
};

const getStatusLabel = (
  status: "attending" | "not_attending" | "pending" | null
): string => {
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
};

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-light-surface dark:bg-dark-surface rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-light-divider dark:border-dark-divider"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
          {event.title}
        </h3>
        {event.userAttendanceStatus !== null && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              event.userAttendanceStatus
            )}`}
          >
            {getStatusLabel(event.userAttendanceStatus)}
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        <p>種別: {event.eventTypeName}</p>
        <p>開催: {formatDate(event.startDatetime)}</p>
        {event.meetingDatetime && (
          <p>集合: {formatDate(event.meetingDatetime)}</p>
        )}
        {event.eventPlaceName && <p>会場: {event.eventPlaceName}</p>}
        <p>締切: {formatDate(event.responseDeadlineDatetime)}</p>
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <span className="px-2 py-1 bg-status-attending-bg text-status-attending-text rounded">
          参加 {event.attendingCount}
        </span>
        <span className="px-2 py-1 bg-status-absent-bg text-status-absent-text rounded">
          欠席 {event.notAttendingCount}
        </span>
        <span className="px-2 py-1 bg-status-pending-bg text-status-pending-text rounded">
          保留 {event.pendingCount}
        </span>
        <span className="px-2 py-1 bg-status-unanswered-bg text-status-unanswered-text rounded">
          未回答 {event.unansweredCount}
        </span>
      </div>
    </Link>
  );
};
