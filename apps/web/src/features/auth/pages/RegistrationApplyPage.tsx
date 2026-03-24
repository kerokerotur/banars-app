import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { initializeLiff, getLiffIdToken } from "@/lib/liff";
import { registrationApply } from "@/services/auth.service";

type State = "loading" | "confirm" | "submitting" | "success" | "error";

export const RegistrationApplyPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const isLoggedIn = await initializeLiff();
        if (!isLoggedIn) {
          setErrorMessage("LINEログインが必要です。LINEアプリからアクセスしてください。");
          setState("error");
          return;
        }

        const token = await getLiffIdToken();
        if (!token) {
          setErrorMessage("LINEトークンの取得に失敗しました。");
          setState("error");
          return;
        }

        // JWT からプロフィール情報を取得（デコードのみ、検証はサーバー側）
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setDisplayName(payload.name ?? "");
          setAvatarUrl(payload.picture ?? null);
        } catch {
          // プロフィール取得失敗は無視（申請自体は続行可能）
        }

        setIdToken(token);
        setState("confirm");
      } catch {
        setErrorMessage("LINEの初期化に失敗しました。");
        setState("error");
      }
    };

    initialize();
  }, []);

  const handleApply = async () => {
    if (!idToken) return;

    try {
      setState("submitting");
      await registrationApply(idToken);
      setState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "申請に失敗しました";
      setErrorMessage(message);
      setState("error");
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
            新規登録申請
          </p>
        </div>

        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              LINEアカウント情報を確認中...
            </p>
          </div>
        )}

        {state === "confirm" && (
          <div className="space-y-6">
            {/* プロフィールプレビュー */}
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 flex items-center gap-4 border border-light-divider dark:border-dark-divider">
              <div className="w-16 h-16 rounded-full bg-light-surface-container dark:bg-dark-surface-container overflow-hidden flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div>
                <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-lg">
                  {displayName || "名前未設定"}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                  LINEアカウント
                </p>
              </div>
            </div>

            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
              上記のLINEアカウントで登録申請します。運営が確認後、LINEにてご連絡します。
            </p>

            <button
              onClick={handleApply}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-xl transition-colors"
            >
              申請する
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full text-light-text-secondary dark:text-dark-text-secondary font-medium py-3 px-4 rounded-xl border border-light-divider dark:border-dark-divider hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
            >
              戻る
            </button>
          </div>
        )}

        {state === "submitting" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              申請中...
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                申請が完了しました
              </h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                運営が確認後、LINEにてご連絡します。しばらくお待ちください。
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-xl transition-colors"
            >
              ログインページへ
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ログインページへ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
