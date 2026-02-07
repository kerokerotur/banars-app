import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEvent, useEventTypes } from "@/hooks/useEvents";
import type { CreateEventInput } from "@/types/event";

const eventSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  eventTypeId: z.string().min(1, "イベント種別を選択してください"),
  startDatetime: z.string().min(1, "開催日時を入力してください"),
  meetingDatetime: z.string().optional(),
  responseDeadlineDatetime: z
    .string()
    .min(1, "回答締切日時を入力してください"),
  notesMarkdown: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export const EventCreatePage = () => {
  const navigate = useNavigate();
  const { data: eventTypes } = useEventTypes();
  const createEventMutation = useCreateEvent();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setError(null);

      const input: CreateEventInput = {
        title: data.title,
        eventTypeId: data.eventTypeId,
        startDatetime: data.startDatetime,
        meetingDatetime: data.meetingDatetime || undefined,
        responseDeadlineDatetime: data.responseDeadlineDatetime,
        notesMarkdown: data.notesMarkdown || undefined,
      };

      const result = await createEventMutation.mutateAsync(input);

      // 作成したイベントの詳細ページへ遷移
      navigate(`/events/${result.eventId}`);
    } catch (err) {
      console.error("イベント作成エラー:", err);
      setError(
        err instanceof Error
          ? err.message
          : "イベントの作成に失敗しました"
      );
    }
  };

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

        {/* フォーム */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-light-divider dark:border-dark-divider">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
            イベント作成
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                placeholder="例: 練習試合 vs チームA"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* イベント種別 */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                イベント種別 <span className="text-red-500">*</span>
              </label>
              <select
                {...register("eventTypeId")}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="">選択してください</option>
                {eventTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.eventTypeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.eventTypeId.message}
                </p>
              )}
            </div>

            {/* 開催日時 */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                開催日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("startDatetime")}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              />
              {errors.startDatetime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startDatetime.message}
                </p>
              )}
            </div>

            {/* 集合時刻 */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                集合時刻
              </label>
              <input
                type="datetime-local"
                {...register("meetingDatetime")}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              />
            </div>

            {/* 回答締切日時 */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                回答締切日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("responseDeadlineDatetime")}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              />
              {errors.responseDeadlineDatetime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.responseDeadlineDatetime.message}
                </p>
              )}
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                備考
              </label>
              <textarea
                {...register("notesMarkdown")}
                rows={4}
                className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                placeholder="その他の情報や注意事項など"
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="flex-1 bg-light-surface-container dark:bg-dark-surface-container text-light-text-primary dark:text-dark-text-primary font-medium py-3 px-4 rounded-lg transition-colors border border-light-divider dark:border-dark-divider hover:bg-light-divider dark:hover:bg-dark-divider"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "作成中..." : "作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
