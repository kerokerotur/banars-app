import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, BadgeCheck, MessageCircle, PlusCircle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const LINE_FRIEND_ADD_URL = "https://lin.ee/8ee7THq";

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isError, error, refetch } = useUserProfile();

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
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                {userProfile.role}
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
              <div>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  ユーザーID
                </p>
                <p className="text-sm text-light-text-primary dark:text-dark-text-primary break-all mt-0.5">
                  {userProfile.userId}
                </p>
              </div>
            </div>
          </div>

          {/* LINE通知カード */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-5 shadow-sm border border-light-divider dark:border-dark-divider">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={20} className="text-primary shrink-0" />
              <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
                LINE通知
              </h3>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              LINE公式アカウントを友だち追加すると、出欠回答期限のリマインド通知をLINEで受け取れます。
            </p>
            <a
              href={LINE_FRIEND_ADD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#00C300" }}
            >
              <PlusCircle size={20} />
              LINE友だち追加
            </a>
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
