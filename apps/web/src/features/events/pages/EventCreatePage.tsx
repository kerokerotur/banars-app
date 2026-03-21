import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
import {
  useCreateEvent,
  useEventTypes,
  useEventPlaces,
} from "@/hooks/useEvents";
import type { CreateEventInput } from "@/types/event";

type MeetingPreset = "30min" | "60min" | "90min" | "custom";
type DeadlinePreset = "3days" | "7days" | "10days" | "custom";

const MEETING_PRESETS: { value: MeetingPreset; label: string; minutes: number }[] = [
  { value: "30min", label: "30分前", minutes: 30 },
  { value: "60min", label: "60分前", minutes: 60 },
  { value: "90min", label: "90分前", minutes: 90 },
];

const DEADLINE_PRESETS: { value: DeadlinePreset; label: string; days: number }[] = [
  { value: "3days", label: "3日前", days: 3 },
  { value: "7days", label: "7日前", days: 7 },
  { value: "10days", label: "10日前", days: 10 },
];

const toLocalDatetimeStr = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toISOWithOffset = (localStr: string): string => {
  if (!localStr) return "";
  const d = new Date(localStr);
  return d.toISOString();
};

export const EventCreatePage = () => {
  const navigate = useNavigate();
  const { data: eventTypes } = useEventTypes();
  const { data: eventPlaces } = useEventPlaces();
  const createEventMutation = useCreateEvent();

  const [title, setTitle] = useState("");
  const [eventTypeId, setEventTypeId] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [meetingDatetime, setMeetingDatetime] = useState("");
  const [meetingPreset, setMeetingPreset] = useState<MeetingPreset | null>(null);
  const [responseDeadline, setResponseDeadline] = useState("");
  const [deadlinePreset, setDeadlinePreset] = useState<DeadlinePreset | null>(null);
  const [notesMarkdown, setNotesMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const selectedPlace = useMemo(
    () => eventPlaces?.find((p) => p.id === selectedPlaceId) ?? null,
    [eventPlaces, selectedPlaceId]
  );

  const hasStartDatetime = !!startDatetime;

  const computeMeetingTime = (start: string, minutes: number): string => {
    if (!start) return "";
    const d = new Date(start);
    d.setMinutes(d.getMinutes() - minutes);
    return toLocalDatetimeStr(d);
  };

  const computeDeadline = (start: string, days: number): string => {
    if (!start) return "";
    const d = new Date(start);
    d.setDate(d.getDate() - days);
    return toLocalDatetimeStr(d);
  };

  const handleStartDatetimeChange = (value: string) => {
    setStartDatetime(value);

    if (!value) {
      setMeetingDatetime("");
      setMeetingPreset(null);
      setResponseDeadline("");
      setDeadlinePreset(null);
      return;
    }

    if (meetingPreset && meetingPreset !== "custom") {
      const preset = MEETING_PRESETS.find((p) => p.value === meetingPreset);
      if (preset) setMeetingDatetime(computeMeetingTime(value, preset.minutes));
    }

    if (deadlinePreset && deadlinePreset !== "custom") {
      const preset = DEADLINE_PRESETS.find((p) => p.value === deadlinePreset);
      if (preset) setResponseDeadline(computeDeadline(value, preset.days));
    }
  };

  const handleMeetingPresetChange = (preset: MeetingPreset) => {
    setMeetingPreset(preset);
    if (preset !== "custom") {
      const p = MEETING_PRESETS.find((x) => x.value === preset);
      if (p) setMeetingDatetime(computeMeetingTime(startDatetime, p.minutes));
    }
  };

  const handleDeadlinePresetChange = (preset: DeadlinePreset) => {
    setDeadlinePreset(preset);
    if (preset !== "custom") {
      const p = DEADLINE_PRESETS.find((x) => x.value === preset);
      if (p) setResponseDeadline(computeDeadline(startDatetime, p.days));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "タイトルを入力してください";
    if (!eventTypeId) errors.eventType = "イベント種別を選択してください";
    if (!selectedPlace) errors.place = "イベント会場を選択してください";
    else if (!selectedPlace.googleMapsUrl) errors.place = "Google Maps URLが設定されていない会場です";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!selectedPlace?.googleMapsUrl) return;

    setError(null);

    const input: CreateEventInput = {
      title: title.trim(),
      eventTypeId,
      startDatetime: startDatetime ? toISOWithOffset(startDatetime) : null,
      meetingDatetime: meetingDatetime ? toISOWithOffset(meetingDatetime) : null,
      responseDeadlineDatetime: responseDeadline ? toISOWithOffset(responseDeadline) : null,
      place: {
        name: selectedPlace.name,
        googleMapsUrl: selectedPlace.googleMapsUrl,
      },
      notesMarkdown: notesMarkdown.trim() || undefined,
    };

    try {
      await createEventMutation.mutateAsync(input);
      navigate("/events");
    } catch (err) {
      console.error("イベント作成エラー:", err);
      setError(
        err instanceof Error ? err.message : "イベントの作成に失敗しました"
      );
    }
  };

  return (
    <div className="pb-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-light-background dark:bg-dark-background z-10">
        <button
          onClick={() => navigate("/events")}
          className="p-2 -ml-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
          イベント作成
        </h1>
      </div>

      <div className="px-4 space-y-6">
        {/* エラー */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* タイトル */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="例: 練習試合 vs レッドソックス"
          />
          {validationErrors.title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
          )}
        </div>

        {/* イベント種別 */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            イベント種別
          </label>
          <div className="relative">
            <select
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">イベント種別を選択</option>
              {eventTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary pointer-events-none"
            />
          </div>
          {validationErrors.eventType && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.eventType}</p>
          )}
        </div>

        {/* イベント会場 */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            イベント会場 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">イベント会場を選択</option>
              {eventPlaces?.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary pointer-events-none"
            />
          </div>
          {validationErrors.place && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.place}</p>
          )}
        </div>

        {/* 日時（任意） */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            日時（任意）
          </label>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
            開始日時
          </p>
          <div className="relative">
            <input
              type="datetime-local"
              value={startDatetime}
              onChange={(e) => handleStartDatetimeChange(e.target.value)}
              className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* 集合日時 */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            集合日時
            {!hasStartDatetime && (
              <span className="ml-2 text-xs text-red-500 font-normal">
                ※開始日時を先に設定してください
              </span>
            )}
          </label>
          {hasStartDatetime ? (
            <>
              <div className="flex gap-2 mb-2">
                {MEETING_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleMeetingPresetChange(preset.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      meetingPreset === preset.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-light-divider dark:border-dark-divider text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleMeetingPresetChange("custom")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    meetingPreset === "custom"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-light-divider dark:border-dark-divider text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                  }`}
                >
                  カスタム
                </button>
              </div>
              {meetingPreset === "custom" && (
                <input
                  type="datetime-local"
                  value={meetingDatetime}
                  onChange={(e) => setMeetingDatetime(e.target.value)}
                  className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
              {meetingPreset && meetingPreset !== "custom" && meetingDatetime && (
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  → {new Date(meetingDatetime).toLocaleString("ja-JP")}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg">
              <Info size={16} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                開始日時を先に設定してください
              </span>
            </div>
          )}
        </div>

        {/* 回答締切 */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            回答締切
            {!hasStartDatetime && (
              <span className="ml-2 text-xs text-red-500 font-normal">
                ※開始日時を設定してください
              </span>
            )}
          </label>
          {hasStartDatetime ? (
            <>
              <div className="flex gap-2 mb-2">
                {DEADLINE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleDeadlinePresetChange(preset.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      deadlinePreset === preset.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-light-divider dark:border-dark-divider text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleDeadlinePresetChange("custom")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    deadlinePreset === "custom"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-light-divider dark:border-dark-divider text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                  }`}
                >
                  カスタム
                </button>
              </div>
              {deadlinePreset === "custom" && (
                <input
                  type="datetime-local"
                  value={responseDeadline}
                  onChange={(e) => setResponseDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
              {deadlinePreset && deadlinePreset !== "custom" && responseDeadline && (
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  → {new Date(responseDeadline).toLocaleString("ja-JP")}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg">
              <Info size={16} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                開始日時を先に設定してください
              </span>
            </div>
          )}
        </div>

        {/* メモ・持ち物（任意） */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            メモ・持ち物（任意）
          </label>
          <textarea
            value={notesMarkdown}
            onChange={(e) => setNotesMarkdown(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-light-surface-container dark:bg-dark-surface-container rounded-lg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="持ち物や注意事項など"
          />
        </div>

        {/* 作成ボタン */}
        <button
          onClick={handleSubmit}
          disabled={createEventMutation.isPending}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createEventMutation.isPending ? "作成中..." : "イベントを作成"}
        </button>
      </div>
    </div>
  );
};
