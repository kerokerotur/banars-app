import { useEventList } from "@/hooks/useEvents";
import { EventCard } from "../components/EventCard";

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
    <div className="px-4 py-4 space-y-3">
      {events && events.length > 0 ? (
        events.map((event) => <EventCard key={event.id} event={event} />)
      ) : (
        <div className="text-center py-12">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            イベントがまだありません
          </p>
        </div>
      )}
    </div>
  );
};
