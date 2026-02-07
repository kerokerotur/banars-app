import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

/**
 * 認証ガード
 * 認証が必要なルートを保護します
 */
export const AuthGuard = () => {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
