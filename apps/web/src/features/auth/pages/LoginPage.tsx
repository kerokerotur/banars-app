import type { Session } from "@supabase/supabase-js";
import { Spinner } from "@/components/ui/Spinner";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import {
  initializeLiff,
  getLiffIdToken,
  loginWithLiff,
  logoutLiff,
} from "@/lib/liff";
import { loginWithLine, exchangeSessionToken, ApiError } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth";

/**
 * LIFFでログイン済みの状態から、IDトークン取得〜セッション確立〜ホーム遷移まで行う
 */
async function completeLoginWithLiffSession(
  setSession: (session: Session | null) => void,
  navigate: (path: string) => void
): Promise<void> {
  console.log("[Login] completeLoginWithLiffSession: 開始");
  const idToken = await getLiffIdToken();
  if (!idToken) {
    console.log("[Login] completeLoginWithLiffSession: idToken なし");
    throw new Error("IDトークンの取得に失敗しました");
  }
  console.log("[Login] completeLoginWithLiffSession: loginWithLine 呼び出し");
  const { sessionTransferToken } = await loginWithLine(idToken);
  console.log(
    "[Login] completeLoginWithLiffSession: exchangeSessionToken 呼び出し"
  );
  const { session } = await exchangeSessionToken(sessionTransferToken);
  setSession(session);
  console.log(
    "[Login] completeLoginWithLiffSession: セッション設定済み、/events へ遷移"
  );
  navigate("/events");
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserNotFound, setIsUserNotFound] = useState(false);

  const completeLogin = useCallback(() => {
    return completeLoginWithLiffSession(setSession, navigate);
  }, [setSession, navigate]);

  /**
   * ログインフロー失敗時に LIFF セッションをクリアする。
   * 次回ボタン押下で isLoggedIn=false → liff.login() → フレッシュな認証フローへ。
   * LINE 内ブラウザでも liff.login() がページリロードを起こし、
   * 再 init 時に LINE クライアントからフレッシュなトークンを取得できる。
   */
  const handleTokenError = useCallback(() => {
    logoutLiff();
  }, []);

  // リダイレクト戻り時: LIFF初期化後にログイン済みなら自動でログイン完了まで進める
  useEffect(() => {
    let cancelled = false;
    console.log("[Login] useEffect: マウント時チェック開始", {
      href: typeof window !== "undefined" ? window.location.href : "",
    });

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsUserNotFound(false);
        console.log("[Login] useEffect: initializeLiff 呼び出し");
        const isLoggedIn = await initializeLiff();
        if (cancelled) {
          console.log("[Login] useEffect: キャンセル済み（init 後）");
          return;
        }
        console.log("[Login] useEffect: initializeLiff 完了", { isLoggedIn });
        if (!isLoggedIn) {
          console.log("[Login] useEffect: 未ログインのため自動ログインスキップ");
          return;
        }
        console.log("[Login] useEffect: ログイン済み、completeLogin 開始");
        await completeLogin();
        if (!cancelled) console.log("[Login] useEffect: completeLogin 完了");
      } catch (err) {
        if (cancelled) return;
        console.error("[Login] useEffect: エラー", err);
        handleTokenError();
        if (err instanceof ApiError && err.code === "user_not_found") {
          setIsUserNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "ログインに失敗しました");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          console.log("[Login] useEffect: 処理完了");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      console.log("[Login] useEffect: クリーンアップ");
    };
  }, [completeLogin, handleTokenError]);

  const handleLogin = async () => {
    console.log("[Login] handleLogin: ボタンクリック");
    try {
      setIsLoading(true);
      setError(null);
      setIsUserNotFound(false);

      const isLoggedIn = await initializeLiff();
      console.log("[Login] handleLogin: initializeLiff 完了", { isLoggedIn });

      if (!isLoggedIn) {
        console.log("[Login] handleLogin: 未ログイン、LINE へリダイレクト");
        await loginWithLiff();
        return;
      }

      console.log("[Login] handleLogin: ログイン済み、completeLogin 開始");
      await completeLogin();
      console.log("[Login] handleLogin: completeLogin 完了");
    } catch (err) {
      console.error("[Login] handleLogin: エラー", err);
      handleTokenError();
      if (err instanceof ApiError && err.code === "user_not_found") {
        setIsUserNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : "ログインに失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: '#001F3F' }}
    >
      {/* スプラッシュ画像 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <img
          src="/images/app_splash.png"
          alt="Banars"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ボタンエリア */}
      <div className="px-6 pt-4 pb-10 space-y-3" style={{ backgroundColor: '#001F3F' }}>
        {isUserNotFound && (
          <div className="mb-2 p-4 bg-yellow-50/90 border border-yellow-400 rounded-lg">
            <p className="text-yellow-900 text-sm font-medium">
              このLINEアカウントはまだ登録されていません
            </p>
            <p className="text-yellow-800 text-xs mt-1">
              下の「新規登録」ボタンから登録を行ってください。
            </p>
          </div>
        )}
        {error && (
          <div className="mb-2 p-4 bg-red-100/90 border border-red-300 rounded-lg">
            <p className="text-red-900 text-sm">{error}</p>
            <p className="text-red-800 text-xs mt-1">
              もう一度「LINE でログイン」を押してください。
            </p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-line hover:bg-line/90 text-white font-bold py-4 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>ログイン中...</span>
            </>
          ) : (
            <>
              <LogIn size={20} />
              <span>LINE でログイン</span>
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/signup")}
          disabled={isLoading}
          className="w-full text-white font-bold py-4 px-4 rounded-xl border border-white/60 flex items-center justify-center gap-2 text-base hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'transparent' }}
        >
          <UserPlus size={20} />
          <span>新規登録</span>
        </button>
      </div>
    </div>
  );
};
