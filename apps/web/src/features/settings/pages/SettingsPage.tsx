import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      try {
        await logout();
        navigate("/login");
      } catch (error) {
        console.error("ログアウトエラー:", error);
        alert("ログアウトに失敗しました");
      }
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          設定
        </h1>

        <div className="space-y-4">
          {/* ユーザー情報 */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-light-divider dark:border-dark-divider">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              アカウント情報
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  表示名
                </p>
                <p className="text-light-text-primary dark:text-dark-text-primary">
                  {user?.user_metadata?.displayName || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  メールアドレス
                </p>
                <p className="text-light-text-primary dark:text-dark-text-primary">
                  {user?.email || "未設定"}
                </p>
              </div>
            </div>
          </div>

          {/* テーマ設定 */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-light-divider dark:border-dark-divider">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              テーマ
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === "light"}
                  onChange={(e) => setTheme(e.target.value as "light")}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  ライト
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={(e) => setTheme(e.target.value as "dark")}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  ダーク
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === "system"}
                  onChange={(e) => setTheme(e.target.value as "system")}
                  className="text-primary"
                />
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  システム設定に従う
                </span>
              </label>
            </div>
          </div>

          {/* ログアウト */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-800 font-medium py-3 px-4 rounded-lg transition-colors border border-red-200 hover:bg-red-100"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};
