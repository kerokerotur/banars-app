import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import {
  getRegistrationApplications,
  approveRegistrationApplication,
  rejectRegistrationApplication,
} from "@/services/auth.service";

type StatusTab = "pending" | "approved" | "rejected";

export const RegistrationApplicationListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["registration_applications", activeTab],
    queryFn: () => getRegistrationApplications(activeTab),
  });

  const approveMutation = useMutation({
    mutationFn: approveRegistrationApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_applications"] });
      setProcessingId(null);
    },
    onError: () => {
      setProcessingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRegistrationApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_applications"] });
      setProcessingId(null);
    },
    onError: () => {
      setProcessingId(null);
    },
  });

  const handleApprove = (id: string) => {
    setProcessingId(id);
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    setProcessingId(id);
    rejectMutation.mutate(id);
  };

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "pending", label: "申請中" },
    { key: "approved", label: "承認済み" },
    { key: "rejected", label: "拒否済み" },
  ];

  return (
    <div className="pb-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-light-background dark:bg-dark-background z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-light-text-primary dark:text-dark-text-primary hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
          登録申請一覧
        </h1>
      </div>

      {/* タブ */}
      <div className="flex border-b border-light-divider dark:border-dark-divider px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Spinner />
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
              読み込み中...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {error instanceof Error
                ? error.message
                : "申請一覧の取得に失敗しました"}
            </p>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                  {activeTab === "pending"
                    ? "申請中の登録リクエストはありません"
                    : activeTab === "approved"
                      ? "承認済みの申請はありません"
                      : "拒否済みの申請はありません"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 border border-light-divider dark:border-dark-divider"
                  >
                    <div className="flex items-center gap-3">
                      {/* アバター */}
                      <div className="w-12 h-12 rounded-full bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                        {app.avatarUrl ? (
                          <img
                            src={app.avatarUrl}
                            alt={app.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>

                      {/* 名前・日時 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                          {app.displayName}
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                          {new Date(app.createdAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* 承認・拒否ボタン（申請中のみ） */}
                      {activeTab === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          {processingId === app.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                disabled={processingId !== null}
                                className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="承認"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                disabled={processingId !== null}
                                className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="拒否"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* ステータスバッジ（申請中以外） */}
                      {activeTab !== "pending" && (
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                            activeTab === "approved"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {activeTab === "approved" ? "承認済み" : "拒否済み"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
