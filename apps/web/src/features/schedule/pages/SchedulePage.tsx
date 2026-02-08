import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useEventList } from "@/hooks/useEvents";
import { EventListModal } from "../components/EventListModal";
import type { EventListItem } from "@/types/event";
import { startOfDay, isSameDay, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export const SchedulePage = () => {
  const { data: events, isLoading, error } = useEventList();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showModal, setShowModal] = useState(false);

  // イベント日付マップを作成（日付 → イベントリスト）
  const eventsMap = useMemo(() => {
    if (!events) return new Map<string, EventListItem[]>();

    const map = new Map<string, EventListItem[]>();
    events.forEach((event) => {
      const dateKey = startOfDay(parseISO(event.startDatetime)).toISOString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // イベントがある日付のリスト
  const eventDates = useMemo(() => {
    return Array.from(eventsMap.keys()).map((dateStr) => parseISO(dateStr));
  }, [eventsMap]);

  // 選択された日のイベント
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = startOfDay(selectedDate).toISOString();
    return eventsMap.get(dateKey) || [];
  }, [selectedDate, eventsMap]);

  // 日付選択時の処理
  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const dateKey = startOfDay(date).toISOString();
    const dayEvents = eventsMap.get(dateKey);

    // イベントがある場合のみモーダルを表示
    if (dayEvents && dayEvents.length > 0) {
      setShowModal(true);
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            イベントを取得中...
          </p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              {error instanceof Error
                ? error.message
                : "イベントの読み込みに失敗しました"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          スケジュール
        </h1>

        {/* カレンダー */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 shadow-sm border border-light-divider dark:border-dark-divider">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            locale={ja}
            modifiers={{
              hasEvent: eventDates,
            }}
            modifiersStyles={{
              hasEvent: {
                position: "relative",
              },
            }}
            modifiersClassNames={{
              selected: "bg-primary text-white font-bold rounded-full",
              today: "bg-primary-light font-bold rounded-full",
              hasEvent: "has-event",
            }}
            className="schedule-calendar"
          />

          {/* ヒント */}
          <div className="mt-4 pt-4 border-t border-light-divider dark:border-dark-divider">
            <div className="flex items-center justify-center gap-2 text-light-text-secondary dark:text-dark-text-secondary text-sm">
              <span className="text-base">ℹ️</span>
              <p>イベントがある日をタップすると詳細が表示されます</p>
            </div>
          </div>
        </div>

        {/* イベント一覧モーダル */}
        {showModal && selectedDate && (
          <EventListModal
            selectedDate={selectedDate}
            events={selectedDayEvents}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* カスタムスタイル */}
      <style>{`
        .schedule-calendar {
          width: 100%;
          --rdp-accent-color: #E91E63;
          --rdp-background-color: rgba(233, 30, 99, 0.1);
        }

        .schedule-calendar .rdp-month {
          width: 100%;
        }

        .schedule-calendar .rdp-caption {
          color: var(--text-primary);
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .schedule-calendar .rdp-weekday {
          color: var(--text-secondary);
          font-weight: bold;
          font-size: 0.875rem;
        }

        .schedule-calendar .rdp-day {
          color: var(--text-primary);
        }

        .schedule-calendar .rdp-day_button {
          width: 2.5rem;
          height: 2.5rem;
        }

        .schedule-calendar .rdp-day_button:hover {
          background-color: rgba(233, 30, 99, 0.1);
          border-radius: 9999px;
        }

        .schedule-calendar .rdp-day_outside {
          color: var(--text-disabled);
        }

        /* イベントマーカー */
        .schedule-calendar .has-event .rdp-day_button::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #E91E63;
          border-radius: 50%;
        }

        /* ダークモード対応 */
        .dark .schedule-calendar {
          --text-primary: #E0E0E0;
          --text-secondary: #9E9E9E;
          --text-disabled: #616161;
        }

        /* ライトモード */
        .schedule-calendar {
          --text-primary: #212121;
          --text-secondary: #757575;
          --text-disabled: #BDBDBD;
        }
      `}</style>
    </div>
  );
};
