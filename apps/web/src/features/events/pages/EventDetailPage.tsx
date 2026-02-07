import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEventDetail } from "@/hooks/useEvents";
import { useAttendanceSummary } from "@/hooks/useAttendance";
import { formatDate } from "@/utils/date";
import { AttendanceModal } from "@/features/attendance/components/AttendanceModal";
import { AttendanceList } from "@/features/attendance/components/AttendanceList";

export const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEventDetail(eventId || "");
  const { data: summary } = useAttendanceSummary(eventId || "");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            イベント詳細を読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              {error instanceof Error
                ? error.message
                : "イベントが見つかりませんでした"}
            </p>
          </div>
          <button
            onClick={() => navigate("/events")}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            イベント一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // 締切判定
  const isDeadlinePassed =
    new Date(event.responseDeadlineDatetime) < new Date();

  // 現在の出欠状態を取得
  const currentAttendance = summary
    ? [...summary.attending, ...summary.notAttending, ...summary.pending].find(
        (user) => user.userId === "current_user_id" // TODO: 実際のユーザーIDを取得
      )
    : null;

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 戻るボタン */}
        <button
          onClick={() => navigate("/events")}
          className="mb-4 text-primary hover:text-primary-dark font-medium"
        >
          ← イベント一覧に戻る
        </button>

        {/* イベント詳細カード */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-light-divider dark:border-dark-divider mb-4">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            {event.title}
          </h1>

          <div className="space-y-3 text-light-text-secondary dark:text-dark-text-secondary">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                イベント種別
              </p>
              <p className="text-light-text-primary dark:text-dark-text-primary">
                {event.eventTypeName}
              </p>
            </div>

            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                開催日時
              </p>
              <p className="text-light-text-primary dark:text-dark-text-primary">
                {formatDate(event.startDatetime)}
              </p>
            </div>

            {event.meetingDatetime && (
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  集合時刻
                </p>
                <p className="text-light-text-primary dark:text-dark-text-primary">
                  {formatDate(event.meetingDatetime)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                回答締切
              </p>
              <p className="text-light-text-primary dark:text-dark-text-primary">
                {formatDate(event.responseDeadlineDatetime)}
                {isDeadlinePassed && (
                  <span className="ml-2 text-red-500 text-sm">（締切済）</span>
                )}
              </p>
            </div>

            {event.eventPlaceName && (
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  会場
                </p>
                <p className="text-light-text-primary dark:text-dark-text-primary">
                  {event.eventPlaceName}
                </p>
                {event.eventPlaceAddress && (
                  <p className="text-sm mt-1">{event.eventPlaceAddress}</p>
                )}
                {event.eventPlaceGoogleMapsUrl && (
                  <a
                    href={event.eventPlaceGoogleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark text-sm mt-1 inline-block"
                  >
                    Google Mapsで開く →
                  </a>
                )}
              </div>
            )}

            {event.notesMarkdown && (
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  備考
                </p>
                <div className="text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                  {event.notesMarkdown}
                </div>
              </div>
            )}
          </div>

          {/* 出欠登録ボタン */}
          <div className="mt-6 pt-6 border-t border-light-divider dark:border-dark-divider">
            <button
              onClick={() => setShowAttendanceModal(true)}
              disabled={isDeadlinePassed}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentAttendance ? "出欠を変更" : "出欠を登録"}
            </button>
            {currentAttendance && (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                現在の回答:{" "}
                {currentAttendance.status === "attending"
                  ? "参加"
                  : currentAttendance.status === "not_attending"
                  ? "欠席"
                  : "保留"}
              </p>
            )}
          </div>
        </div>

        {/* 出欠者一覧 */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-light-divider dark:border-dark-divider mb-4">
          <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            出欠状況
          </h2>
          <AttendanceList eventId={eventId || ""} />
        </div>

        {/* 編集・削除ボタン（運営のみ） */}
        <div className="flex gap-2">
          <Link
            to={`/events/${eventId}/edit`}
            className="flex-1 bg-light-surface-container dark:bg-dark-surface-container text-light-text-primary dark:text-dark-text-primary font-medium py-3 px-4 rounded-lg transition-colors text-center border border-light-divider dark:border-dark-divider hover:bg-light-divider dark:hover:bg-dark-divider"
          >
            編集
          </Link>
          <button
            className="flex-1 bg-red-50 text-red-800 font-medium py-3 px-4 rounded-lg transition-colors border border-red-200 hover:bg-red-100"
            onClick={() => {
              if (confirm("このイベントを削除しますか？")) {
                alert("削除機能は実装中です");
              }
            }}
          >
            削除
          </button>
        </div>
      </div>

      {/* 出欠登録モーダル */}
      {showAttendanceModal && (
        <AttendanceModal
          eventId={eventId || ""}
          currentStatus={currentAttendance?.status || null}
          currentComment={currentAttendance?.comment || null}
          isDeadlinePassed={isDeadlinePassed}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
    </div>
  );
};
