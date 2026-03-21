import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Trash2, ExternalLink } from "lucide-react";
import { useEventPlaces, useDeletePlace } from "@/hooks/useEvents";
import { Spinner } from "@/components/ui/Spinner";
import { PlaceCreateModal } from "../components/PlaceCreateModal";

export const PlaceManagementPage = () => {
  const navigate = useNavigate();
  const { data: places, isLoading } = useEventPlaces();
  const deletePlaceMutation = useDeletePlace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await deletePlaceMutation.mutateAsync(confirmDeleteId);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmingPlace = places?.find((p) => p.id === confirmDeleteId);

  return (
    <div className="pb-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-light-background dark:bg-dark-background z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            イベント会場管理
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">読み込み中...</p>
        </div>
      )}

      {/* 空 */}
      {!isLoading && (!places || places.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6">
          <MapPin size={56} className="text-light-text-disabled dark:text-dark-text-disabled" />
          <p className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">
            登録された会場がありません
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
            右上の＋ボタンから会場を登録してください
          </p>
        </div>
      )}

      {/* 会場一覧 */}
      {!isLoading && places && places.length > 0 && (
        <div className="divide-y divide-light-divider dark:divide-dark-divider">
          {places.map((place) => (
            <div key={place.id} className="flex items-center gap-3 px-4 py-3.5">
              <MapPin size={20} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  {place.name}
                </p>
                {place.googleMapsUrl && (
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors mt-0.5 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={11} />
                    <span className="truncate">{place.googleMapsUrl}</span>
                  </a>
                )}
              </div>
              {deletingId === place.id ? (
                <Spinner size="sm" />
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(place.id)}
                  className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 会場作成モーダル */}
      {showCreateModal && (
        <PlaceCreateModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* 削除確認ダイアログ */}
      {confirmDeleteId && confirmingPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-light-background dark:bg-dark-background rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
              会場を削除
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              「{confirmingPlace.name}」を削除しますか？
              <br />
              この会場を使用しているイベントがある場合は削除できません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:opacity-70"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
