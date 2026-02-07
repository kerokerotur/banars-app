import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  initializeLiff,
  getLiffIdToken,
  getLiffProfile,
} from "@/lib/liff";
import { initialSignup, exchangeSessionToken } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inviteToken = searchParams.get("token");

    if (!inviteToken) {
      setError("招待リンクが無効です");
      setIsLoading(false);
      return;
    }

    handleSignup(inviteToken);
  }, [searchParams]);

  const handleSignup = async (inviteToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // LIFF初期化
      const isLoggedIn = await initializeLiff();

      if (!isLoggedIn) {
        setError("LINEログインが必要です");
        return;
      }

      // IDトークンとプロフィール取得
      const idToken = await getLiffIdToken();
      const profile = await getLiffProfile();

      if (!idToken || !profile) {
        throw new Error("LINE認証情報の取得に失敗しました");
      }

      // initial_signup Edge Function呼び出し
      const { sessionToken } = await initialSignup({
        inviteToken,
        idToken,
        lineProfile: {
          lineUserId: profile.userId,
          displayName: profile.displayName,
          avatarUrl: profile.pictureUrl,
        },
      });

      // Supabaseセッション交換
      const { session } = await exchangeSessionToken(sessionToken);
      setSession(session);

      // ホーム画面へ遷移
      navigate("/events");
    } catch (err) {
      console.error("登録エラー:", err);
      setError(
        err instanceof Error
          ? err.message
          : "アカウント登録に失敗しました"
      );
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
            アカウント登録中...
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin text-4xl">⏳</div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              LINEアカウントで登録しています
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ログインページへ
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
