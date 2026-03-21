import { useState, useEffect, useRef } from "react";
import { X, MapPin, CheckCircle, Loader } from "lucide-react";
import { useCreatePlace } from "@/hooks/useEvents";
import { lookupPlace } from "@/services/events.service";
import type { PlaceLookupResult } from "@/services/events.service";

interface Props {
  onClose: () => void;
  /** 登録成功時に呼ばれる（新規登録・既存選択ともに） */
  onCreated?: (place: { id: string; name: string; googleMapsUrl: string }) => void;
}

type LookupStatus = "idle" | "checking" | "available" | "duplicate" | "error";

const isValidGoogleMapsUrl = (url: string) =>
  url.startsWith("https://") &&
  (url.includes("maps.app.goo.gl") || url.includes("google.com/maps"));

export const PlaceCreateModal = ({ onClose, onCreated }: Props) => {
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [name, setName] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [lookupResult, setLookupResult] = useState<PlaceLookupResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createPlace = useCreatePlace();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!googleMapsUrl || !isValidGoogleMapsUrl(googleMapsUrl)) {
      setLookupStatus("idle");
      setLookupResult(null);
      return;
    }

    setLookupStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await lookupPlace(googleMapsUrl);
        setLookupResult(result);
        setLookupStatus(result.exists ? "duplicate" : "available");
      } catch {
        setLookupStatus("error");
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [googleMapsUrl]);

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!googleMapsUrl) errors.url = "Google Maps URLを入力してください";
    else if (!isValidGoogleMapsUrl(googleMapsUrl)) errors.url = "Google MapsのURLを入力してください";
    if (lookupStatus === "available" && !name.trim()) errors.name = "会場名を入力してください";
    if (Object.keys(errors).length) { setValidationErrors(errors); return; }
    if (lookupStatus !== "available") return;

    try {
      const { placeId } = await createPlace.mutateAsync({ name: name.trim(), googleMapsUrl });
      onCreated?.({ id: placeId, name: name.trim(), googleMapsUrl });
      onClose();
    } catch (err) {
      setValidationErrors({ submit: err instanceof Error ? err.message : "登録に失敗しました" });
    }
  };

  const handleSelectExisting = () => {
    if (!lookupResult?.place) return;
    onCreated?.({
      id: lookupResult.place.id,
      name: lookupResult.place.name,
      googleMapsUrl: lookupResult.place.google_maps_url_normalized,
    });
    onClose();
  };

  const canSubmit = lookupStatus === "available" && name.trim().length > 0 && !createPlace.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-light-background dark:bg-dark-background rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* ヘッダー */}
          <div className="flex items-center gap-2">
            <MapPin size={24} className="text-red-500 shrink-0" />
            <h2 className="flex-1 text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
              新しいイベント会場を追加
            </h2>
            <button onClick={onClose} className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:opacity-70 transition-opacity">
              <X size={20} />
            </button>
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
              地図URL
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => { setGoogleMapsUrl(e.target.value); setValidationErrors({}); }}
              placeholder="https://maps.app.goo.gl/xxxxx"
              className={`w-full px-4 py-3 bg-light-surface dark:bg-dark-surface rounded-lg border text-sm text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                validationErrors.url ? "border-red-400" : "border-light-divider dark:border-dark-divider"
              }`}
            />
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Google Maps で場所を開き、共有→リンクをコピー で取得できます
            </p>
            {validationErrors.url && <p className="text-red-500 text-xs mt-1">{validationErrors.url}</p>}
          </div>

          {/* ルックアップ状態 */}
          {lookupStatus === "checking" && (
            <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <Loader size={14} className="animate-spin" />
              URLの重複を確認しています…
            </div>
          )}
          {lookupStatus === "duplicate" && (
            <p className="text-sm text-red-500">
              この Google Maps URL は既に登録されています。既存の会場を選択してください。
            </p>
          )}
          {lookupStatus === "available" && (
            <p className="text-sm text-green-600 dark:text-green-400">
              未登録のURLです。会場名を入力して登録できます。
            </p>
          )}
          {lookupStatus === "error" && (
            <p className="text-sm text-red-500">重複チェックに失敗しました</p>
          )}

          {/* 既存会場カード */}
          {lookupStatus === "duplicate" && lookupResult?.place && (
            <div className="bg-light-surface-container dark:bg-dark-surface-container rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                既存の会場が見つかりました
              </p>
              <p className="font-bold text-light-text-primary dark:text-dark-text-primary">
                {lookupResult.place.name}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
                {lookupResult.place.google_maps_url_normalized}
              </p>
              <button
                onClick={handleSelectExisting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                <CheckCircle size={16} />
                この会場を使う
              </button>
            </div>
          )}

          {/* 会場名入力（未登録時） */}
          {lookupStatus === "available" && (
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                イベント会場名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setValidationErrors({}); }}
                placeholder="例）東京ドーム"
                className={`w-full px-4 py-3 bg-light-surface dark:bg-dark-surface rounded-lg border text-sm text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  validationErrors.name ? "border-red-400" : "border-light-divider dark:border-dark-divider"
                }`}
              />
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                地図を確認しながら会場名を入力してください
              </p>
              {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
            </div>
          )}

          {validationErrors.submit && (
            <p className="text-red-500 text-sm">{validationErrors.submit}</p>
          )}

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:opacity-70 transition-opacity"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createPlace.isPending ? "登録中…" : "追加"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
