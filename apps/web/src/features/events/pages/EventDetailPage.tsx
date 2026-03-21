import { useState, useMemo } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Trophy,
  Dumbbell,
  Tag,
  Calendar,
  Users as UsersIcon,
  Play,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Send,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import {
  useEventAttendance,
  useRegisterAttendance,
} from "@/hooks/useAttendance";
import { useDeleteEvent } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/auth";
import { formatDate } from "@/utils/date";
import type { EventListItem } from "@/types/event";
import type {
  AttendanceStatus,
  EventAttendanceDetail,
} from "@/types/attendance";

const getEventTypeIcon = (eventTypeName: string) => {
  if (eventTypeName.includes("試合")) return Trophy;
  if (eventTypeName.includes("練習")) return Dumbbell;
  return Tag;
};

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  bgSelected: string;
  borderSelected: string;
}[] = [
  {
    value: "attending",
    label: "出席",
    icon: CheckCircle,
    color: "text-status-attending-text",
    bgSelected: "bg-status-attending-bg",
    borderSelected: "border-status-attending-text",
  },
  {
    value: "not_attending",
    label: "欠席",
    icon: XCircle,
    color: "text-status-absent-text",
    bgSelected: "bg-status-absent-bg",
    borderSelected: "border-status-absent-text",
  },
  {
    value: "pending",
    label: "保留",
    icon: HelpCircle,
    color: "text-status-pending-text",
    bgSelected: "bg-status-pending-bg",
    borderSelected: "border-status-pending-text",
  },
];

const ATTENDANCE_STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
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

export const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const event = (location.state as { event?: EventListItem } | null)?.event;
  const userId = useAuthStore((s) => s.user?.id);

  const {
    data: attendance,
    isLoading: isLoadingAttendance,
  } = useEventAttendance(eventId || "");
  const registerMutation = useRegisterAttendance();
  const deleteMutation = useDeleteEvent();

  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [statusInitialized, setStatusInitialized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const myAttendance = useMemo(() => {
    if (!attendance || !userId) return null;
    return attendance.find((a) => a.memberId === userId) ?? null;
  }, [attendance, userId]);

  if (!statusInitialized && myAttendance) {
    setSelectedStatus(myAttendance.status);
    setComment(myAttendance.comment ?? "");
    setStatusInitialized(true);
  }

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-5xl mb-4">😢</p>
          <p className="text-light-text-primary dark:text-dark-text-primary font-medium mb-4">
            イベントが見つかりませんでした
          </p>
          <button
            onClick={() => navigate("/events")}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            イベント一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const isDeadlinePassed =
    new Date(event.responseDeadlineDatetime) < new Date();
  const EventTypeIcon = getEventTypeIcon(event.eventTypeName);

  const handleSubmitAttendance = async () => {
    if (!eventId || !selectedStatus) return;
    setSubmitError(null);

    if (isDeadlinePassed) {
      setSubmitError("回答締切を過ぎています");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        eventId,
        status: selectedStatus,
        comment: comment || undefined,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "出欠登録に失敗しました"
      );
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    try {
      await deleteMutation.mutateAsync(eventId);
      navigate("/events");
    } catch (err) {
      console.error("削除エラー:", err);
    }
  };

  return (
    <div className="pb-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-light-background dark:bg-dark-background z-10">
        <button
          onClick={() => navigate("/events")}
          className="p-2 -ml-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
          >
            <MoreVertical size={24} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg border border-light-divider dark:border-dark-divider py-1 w-36 z-30">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/events/${eventId}/edit`);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                >
                  <Edit size={16} />
                  編集
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={16} />
                  削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* イベント概要カード */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm">
          {/* タイトル */}
          <div className="flex items-center gap-3 mb-5">
            <EventTypeIcon
              size={28}
              className="text-light-text-primary dark:text-dark-text-primary shrink-0"
            />
            <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {event.title}
            </h1>
          </div>

          {/* 日付 */}
          <InfoRow
            icon={Calendar}
            title={
              event.startDatetime
                ? formatDate(event.startDatetime, "yyyy-MM-dd")
                : "日付未定"
            }
            subtitle="日付"
          />

          {/* 集合時刻 */}
          <InfoRow
            icon={UsersIcon}
            title={
              event.meetingDatetime
                ? formatDate(event.meetingDatetime, "HH:mm")
                : "未定"
            }
            subtitle="集合時刻"
          />

          {/* 開始時刻 */}
          <InfoRow
            icon={Play}
            title={
              event.startDatetime
                ? formatDate(event.startDatetime, "HH:mm")
                : "未定"
            }
            subtitle="開始時刻"
          />

          {/* 会場 */}
          <InfoRow
            icon={MapPin}
            title={event.eventPlaceName ?? "場所未設定"}
            subtitle={event.eventPlaceGoogleMapsUrl ?? ""}
          />

          {/* 地図を開くボタン */}
          {event.eventPlaceGoogleMapsUrl && (
            <a
              href={event.eventPlaceGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-light-divider dark:border-dark-divider rounded-lg text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
            >
              地図を開く
            </a>
          )}
        </div>

        {/* 備考セクション */}
        {event.notesMarkdown && (
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              詳細情報
            </h2>
            <p className="text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
              {event.notesMarkdown}
            </p>
          </div>
        )}

        {/* 出欠状況カード */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
            出欠状況
          </h2>

          {/* 回答期限 */}
          {event.responseDeadlineDatetime && (
            <div className="flex items-center gap-1.5 mb-4">
              <Clock
                size={14}
                className={
                  isDeadlinePassed
                    ? "text-red-500"
                    : "text-light-text-secondary dark:text-dark-text-secondary"
                }
              />
              <span
                className={`text-sm ${
                  isDeadlinePassed
                    ? "text-red-500"
                    : "text-light-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                回答期限: {formatDate(event.responseDeadlineDatetime, "yyyy-MM-dd HH:mm")}
              </span>
            </div>
          )}

          {/* 出席/欠席/保留 ボタン */}
          <div className="flex gap-2 mb-4">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={isDeadlinePassed || registerMutation.isPending}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg border-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? `${opt.bgSelected} ${opt.borderSelected} ${opt.color}`
                      : "border-light-divider dark:border-dark-divider text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                  }`}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* コメント入力 */}
          <div className="mb-4">
            <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
              コメント（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isDeadlinePassed || registerMutation.isPending}
              rows={2}
              className="w-full px-3 py-2.5 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="出席/欠席/保留の理由や補足を記入できます"
            />
          </div>

          {/* エラー表示 */}
          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          {/* 回答するボタン */}
          <button
            onClick={handleSubmitAttendance}
            disabled={
              !selectedStatus ||
              isDeadlinePassed ||
              registerMutation.isPending
            }
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {registerMutation.isPending ? "送信中..." : "回答する"}
          </button>

          {isDeadlinePassed && (
            <p className="mt-2 text-xs text-red-500 text-center">
              締切後のため変更できません
            </p>
          )}
        </div>

        {/* 回答者リスト */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
              回答者リスト
            </h2>
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {attendance?.length ?? 0} 名
            </span>
          </div>

          {isLoadingAttendance ? (
            <div className="flex items-center justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : !attendance || attendance.length === 0 ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center py-4">
              まだ回答がありません
            </p>
          ) : (
            <div className="space-y-2">
              {attendance.map((a) => (
                <AttendanceTile key={a.id} attendance={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              イベントを削除
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-5">
              このイベントを削除してもよろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-light-divider dark:border-dark-divider rounded-lg text-light-text-primary dark:text-dark-text-primary font-medium hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-start gap-3 mb-4">
    <Icon size={20} className="text-primary shrink-0 mt-0.5" />
    <div>
      <p className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const AttendanceTile = ({
  attendance,
}: {
  attendance: EventAttendanceDetail;
}) => {
  const badge = ATTENDANCE_STATUS_BADGE[attendance.status];

  return (
    <div className="flex items-center gap-3 p-3 bg-light-surface-container dark:bg-dark-surface-container rounded-xl">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-light-divider dark:bg-dark-divider flex items-center justify-center shrink-0">
        {attendance.avatarUrl ? (
          <img
            src={attendance.avatarUrl}
            alt={attendance.displayName ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
          {attendance.displayName ?? attendance.memberId}
        </p>
        {attendance.comment && (
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
            {attendance.comment}
          </p>
        )}
      </div>
      {badge && (
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      )}
    </div>
  );
};
