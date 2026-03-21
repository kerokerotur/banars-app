import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft, User, BadgeCheck, Copy, Check } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const ROLE_LABELS: Record<string, string> = {
  manager: "運営",
  member: "メンバー",
};

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isError, error, refetch } = useUserProfile();
  const [copied, setCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (!userProfile?.userId) return;
    await navigator.clipboard.writeText(userProfile.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          ユーザー情報
        </h1>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            ユーザー情報を取得中...
          </p>
        </div>
      )}

      {/* エラー */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 px-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-3xl text-red-500">!</span>
          </div>
          <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            エラーが発生しました
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
            {error instanceof Error ? error.message : "不明なエラー"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            再試行
          </button>
        </div>
      )}

      {/* プロフィール */}
      {!isLoading && !isError && userProfile && (
        <div className="px-6">
          {/* アバター・名前・ロール */}
          <div className="flex flex-col items-center pt-8 pb-8">
            <div className="w-32 h-32 rounded-full border-2 border-primary-light/30 overflow-hidden bg-primary-light/20 flex items-center justify-center mb-6">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={64} className="text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {userProfile.displayName}
            </h2>
            {userProfile.role && (
              <span className="mt-3 px-4 py-1.5 rounded-full text-sm font-medium bg-primary-light/20 text-primary border border-primary-light/30">
                {ROLE_LABELS[userProfile.role] ?? userProfile.role}
              </span>
            )}
          </div>

          {/* ユーザー情報カード */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-5 shadow-sm border border-light-divider dark:border-dark-divider mb-4">
            <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              ユーザー情報
            </h3>
            <div className="flex items-start gap-3">
              <BadgeCheck size={20} className="text-light-text-secondary dark:text-dark-text-secondary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  ユーザーID
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-light-text-primary dark:text-dark-text-primary break-all flex-1">
                    {userProfile.userId}
                  </p>
                  <button
                    onClick={handleCopyUserId}
                    className="shrink-0 p-1.5 rounded text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* プロフィールデータなし */}
      {!isLoading && !isError && !userProfile && (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            ユーザー情報がありません
          </p>
        </div>
      )}
    </div>
  );
};
