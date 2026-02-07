import { useState } from "react";
import { useRegisterAttendance } from "@/hooks/useAttendance";
import type { AttendanceStatus } from "@/types/attendance";

interface AttendanceModalProps {
  eventId: string;
  currentStatus: AttendanceStatus | null;
  currentComment: string | null;
  isDeadlinePassed: boolean;
  onClose: () => void;
}

export const AttendanceModal = ({
  eventId,
  currentStatus,
  currentComment,
  isDeadlinePassed,
  onClose,
}: AttendanceModalProps) => {
  const [status, setStatus] = useState<AttendanceStatus>(
    currentStatus || "attending"
  );
  const [comment, setComment] = useState(currentComment || "");
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useRegisterAttendance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDeadlinePassed) {
      setError("回答締切を過ぎています");
      return;
    }

    try {
      setError(null);
      await registerMutation.mutateAsync({
        eventId,
        status,
        comment: comment || undefined,
      });
      onClose();
    } catch (err) {
      console.error("出欠登録エラー:", err);
      setError(
        err instanceof Error ? err.message : "出欠登録に失敗しました"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
          出欠を登録
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isDeadlinePassed && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              回答締切を過ぎています。出欠登録はできません。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 出欠状態選択 */}
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              出欠状態 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="attending"
                  checked={status === "attending"}
                  onChange={(e) =>
                    setStatus(e.target.value as AttendanceStatus)
                  }
                  disabled={isDeadlinePassed}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  参加
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="not_attending"
                  checked={status === "not_attending"}
                  onChange={(e) =>
                    setStatus(e.target.value as AttendanceStatus)
                  }
                  disabled={isDeadlinePassed}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  欠席
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === "pending"}
                  onChange={(e) =>
                    setStatus(e.target.value as AttendanceStatus)
                  }
                  disabled={isDeadlinePassed}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  保留
                </span>
              </label>
            </div>
          </div>

          {/* コメント */}
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
              コメント
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isDeadlinePassed}
              rows={3}
              className="w-full px-3 py-2 border border-light-divider dark:border-dark-divider rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary disabled:opacity-50"
              placeholder="理由や連絡事項など"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-light-surface-container dark:bg-dark-surface-container text-light-text-primary dark:text-dark-text-primary font-medium py-3 px-4 rounded-lg transition-colors border border-light-divider dark:border-dark-divider hover:bg-light-divider dark:hover:bg-dark-divider"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isDeadlinePassed || registerMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? "登録中..." : "登録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
