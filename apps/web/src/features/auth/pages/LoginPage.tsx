import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeLiff, getLiffIdToken } from "@/lib/liff";
import { loginWithLine, exchangeSessionToken } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // LIFF初期化
      const isLoggedIn = await initializeLiff();

      if (!isLoggedIn) {
        // LINEログインページへリダイレクト
        setError("LINEログインが必要です。");
        return;
      }

      // IDトークン取得
      const idToken = await getLiffIdToken();
      if (!idToken) {
        throw new Error("IDトークンの取得に失敗しました");
      }

      // line_login Edge Function呼び出し
      const { sessionToken } = await loginWithLine(idToken);

      // Supabaseセッション交換
      const { session } = await exchangeSessionToken(sessionToken);
      setSession(session);

      // ホーム画面へ遷移
      navigate("/events");
    } catch (err) {
      console.error("ログインエラー:", err);
      setError(
        err instanceof Error ? err.message : "ログインに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            banars
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            草野球チーム管理アプリ
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-line hover:bg-line/90 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>ログイン中...</span>
            </>
          ) : (
            <>
              <span>LINE</span>
              <span>でログイン</span>
            </>
          )}
        </button>

        <p className="mt-4 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          招待リンクからアカウント登録してください
        </p>
      </div>
    </div>
  );
};
