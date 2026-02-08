import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeLiff, getLiffIdToken, loginWithLiff } from "@/lib/liff";
import { loginWithLine, exchangeSessionToken } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth";

/**
 * LIFFでログイン済みの状態から、IDトークン取得〜セッション確立〜ホーム遷移まで行う
 */
async function completeLoginWithLiffSession(
  setSession: (session: Session | null) => void,
  navigate: (path: string) => void
): Promise<void> {
  const idToken = await getLiffIdToken();
  if (!idToken) {
    throw new Error("IDトークンの取得に失敗しました");
  }
  const { sessionToken } = await loginWithLine(idToken);
  const { session } = await exchangeSessionToken(sessionToken);
  setSession(session);
  navigate("/events");
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeLogin = useCallback(() => {
    return completeLoginWithLiffSession(setSession, navigate);
  }, [setSession, navigate]);

  // リダイレクト戻り時: LIFF初期化後にログイン済みなら自動でログイン完了まで進める
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const isLoggedIn = await initializeLiff();
        if (cancelled) return;
        if (!isLoggedIn) return;
        await completeLogin();
      } catch (err) {
        if (cancelled) return;
        console.error("ログインエラー:", err);
        setError(
          err instanceof Error ? err.message : "ログインに失敗しました"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [completeLogin]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isLoggedIn = await initializeLiff();

      if (!isLoggedIn) {
        await loginWithLiff();
        return;
      }

      await completeLogin();
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
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundColor: '#001F3F',
        backgroundImage: 'url(/images/app_splash.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-md w-full px-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            banars
          </h1>
          <p className="text-white text-opacity-90">
            草野球チーム管理アプリ
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 bg-opacity-90 border border-red-300 rounded-lg">
            <p className="text-red-900 text-sm">{error}</p>
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

        <p className="mt-4 text-center text-sm text-white text-opacity-80">
          招待リンクからアカウント登録してください
        </p>
      </div>
    </div>
  );
};
