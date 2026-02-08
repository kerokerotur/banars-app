import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Menu, User, Settings, LogOut, Users } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

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

  const menuItems = [
    {
      icon: Users,
      label: "メンバー一覧",
      onClick: () => {
        navigate("/members");
        setShowMenu(false);
      },
    },
    {
      icon: Settings,
      label: "設定",
      onClick: () => {
        navigate("/settings");
        setShowMenu(false);
      },
    },
    {
      icon: LogOut,
      label: "ログアウト",
      onClick: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-light-surface dark:bg-dark-surface border-b border-light-divider dark:border-dark-divider">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* 左側: ハンバーガーメニュー */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            aria-label="メニュー"
          >
            <Menu size={28} />
          </button>

          {/* ドロップダウンメニュー */}
          {showMenu && (
            <>
              {/* 背景オーバーレイ */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />

              {/* メニューコンテンツ */}
              <div className="absolute left-0 top-12 z-20 w-56 bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg shadow-lg overflow-hidden">
                {menuItems.map((item, index) => (
                  <div key={item.label}>
                    {index > 0 && (
                      <div className="h-px bg-light-divider dark:bg-dark-divider" />
                    )}
                    <button
                      onClick={item.onClick}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                        item.isDestructive
                          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-background"
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={item.isDestructive ? "text-red-600" : ""}
                      />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 右側: ユーザーアバター */}
        <Link
          to="/settings"
          className="flex items-center gap-2 p-1 rounded-full hover:bg-light-background dark:hover:bg-dark-background transition-colors"
        >
          <div className="w-11 h-11 rounded-full border-2 border-primary-light/30 overflow-hidden bg-primary-light/20 flex items-center justify-center">
            {user?.user_metadata?.avatarUrl ? (
              <img
                src={user.user_metadata.avatarUrl}
                alt={user.user_metadata.displayName || "ユーザー"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={26} className="text-primary" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
