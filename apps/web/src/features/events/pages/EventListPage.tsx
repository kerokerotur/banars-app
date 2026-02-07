import { useEventList } from "@/hooks/useEvents";
import { EventCard } from "../components/EventCard";
import { Link } from "react-router-dom";

export const EventListPage = () => {
  const { data: events, isLoading, error, refetch } = useEventList();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
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
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
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

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            イベント一覧
          </h1>
          <Link
            to="/events/new"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            ＋ 新規作成
          </Link>
        </div>

        {/* イベント一覧 */}
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              イベントがまだありません
            </p>
            <Link
              to="/events/new"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              最初のイベントを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
