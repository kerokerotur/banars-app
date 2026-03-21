import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Info, MapPin, Trophy, Dumbbell, Tag, Plus } from "lucide-react";
import {
  useCreateEvent,
  useEventTypes,
  useEventPlaces,
} from "@/hooks/useEvents";
import type { CreateEventInput } from "@/types/event";
import { PlaceCreateModal } from "@/features/places/components/PlaceCreateModal";

const getEventTypeIcon = (name: string): React.ElementType => {
  if (name.includes("試合")) return Trophy;
  if (name.includes("練習")) return Dumbbell;
  return Tag;
};

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
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const [showPlaceCreateModal, setShowPlaceCreateModal] = useState(false);
  const eventTypeRef = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);
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

  const selectedEventType = useMemo(
    () => eventTypes?.find((t) => t.id === eventTypeId) ?? null,
    [eventTypes, eventTypeId]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventTypeRef.current && !eventTypeRef.current.contains(e.target as Node)) {
        setIsEventTypeOpen(false);
      }
      if (venueRef.current && !venueRef.current.contains(e.target as Node)) {
        setIsVenueOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div ref={eventTypeRef} className="relative">
            <button
              type="button"
              onClick={() => setIsEventTypeOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3 bg-light-surface dark:bg-dark-surface rounded-lg border text-sm transition-colors ${
                validationErrors.eventType
                  ? "border-red-400"
                  : "border-light-divider dark:border-dark-divider"
              }`}
            >
              {selectedEventType ? (
                <>
                  {(() => { const Icon = getEventTypeIcon(selectedEventType.name); return <Icon size={18} className="text-light-text-primary dark:text-dark-text-primary shrink-0" />; })()}
                  <span className="flex-1 text-left text-light-text-primary dark:text-dark-text-primary">
                    {selectedEventType.name}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-left text-light-text-secondary dark:text-dark-text-secondary">
                  イベント種別を選択
                </span>
              )}
              {isEventTypeOpen
                ? <ChevronUp size={18} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
                : <ChevronDown size={18} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
              }
            </button>
            {isEventTypeOpen && (
              <div className="absolute z-20 mt-1 w-full bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {eventTypes?.map((type) => {
                  const Icon = getEventTypeIcon(type.name);
                  const isSelected = type.id === eventTypeId;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => { setEventTypeId(type.id); setIsEventTypeOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span>{type.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
          <div ref={venueRef} className="relative">
            <button
              type="button"
              onClick={() => setIsVenueOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3 bg-light-surface dark:bg-dark-surface rounded-lg border text-sm transition-colors ${
                validationErrors.place
                  ? "border-red-400"
                  : "border-light-divider dark:border-dark-divider"
              }`}
            >
              {selectedPlace ? (
                <>
                  <MapPin size={18} className="text-red-500 shrink-0" />
                  <span className="flex-1 text-left text-light-text-primary dark:text-dark-text-primary">
                    {selectedPlace.name}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-left text-light-text-secondary dark:text-dark-text-secondary">
                  イベント会場を選択
                </span>
              )}
              {isVenueOpen
                ? <ChevronUp size={18} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
                : <ChevronDown size={18} className="text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
              }
            </button>
            {isVenueOpen && (
              <div className="absolute z-20 mt-1 w-full bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {eventPlaces?.map((place) => {
                  const isSelected = place.id === selectedPlaceId;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => { setSelectedPlaceId(place.id); setIsVenueOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                        isSelected
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-container dark:hover:bg-dark-surface-container"
                      }`}
                    >
                      <MapPin size={18} className="text-red-500 shrink-0" />
                      <span className={isSelected ? "text-red-600 dark:text-red-400" : ""}>{place.name}</span>
                    </button>
                  );
                })}
                {(eventPlaces?.length ?? 0) > 0 && (
                  <div className="h-px bg-light-divider dark:bg-dark-divider" />
                )}
                <button
                  type="button"
                  onClick={() => { setIsVenueOpen(false); setShowPlaceCreateModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-red-500 hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                >
                  <Plus size={18} className="shrink-0" />
                  <span>新しい場所を追加</span>
                </button>
              </div>
            )}
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

      {/* 会場作成モーダル */}
      {showPlaceCreateModal && (
        <PlaceCreateModal
          onClose={() => setShowPlaceCreateModal(false)}
          onCreated={(place) => {
            setSelectedPlaceId(place.id);
          }}
        />
      )}
    </div>
  );
};
