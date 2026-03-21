import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, MapPin, ChevronRight, Info } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useUserProfile } from "@/hooks/useUserProfile";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { data: userProfile } = useUserProfile();

  const isDarkMode = theme === "dark";
  const isManager = userProfile?.role === "manager";

  const handleToggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
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
          設定
        </h1>
      </div>

      <div className="px-4">
        {/* 外観セクション */}
        <SectionHeader title="外観" />
        <SettingsCard>
          <SettingsTile
            icon={<Moon size={20} />}
            title="ダークモード"
            subtitle={isDarkMode ? "オン" : "オフ"}
            trailing={
              <button
                role="switch"
                aria-checked={isDarkMode}
                onClick={handleToggleDarkMode}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  isDarkMode ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            }
          />
        </SettingsCard>

        {/* 管理セクション（manager のみ） */}
        {isManager && (
          <>
            <SectionHeader title="管理" />
            <SettingsCard>
              <SettingsTile
                icon={<MapPin size={20} />}
                title="イベント会場管理"
                subtitle="会場の登録・削除"
                trailing={
                  <ChevronRight
                    size={20}
                    className="text-light-text-secondary dark:text-dark-text-secondary"
                  />
                }
                onClick={() => navigate("/settings/places")}
              />
            </SettingsCard>
          </>
        )}

        {/* アプリ情報セクション */}
        <SectionHeader title="アプリ情報" />
        <SettingsCard>
          <SettingsTile
            icon={<Info size={20} />}
            title="バージョン"
            trailing={
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                1.0.0
              </span>
            }
          />
        </SettingsCard>

        {/* フッターテキスト */}
        <p className="mt-8 text-center text-xs text-light-text-secondary/70 dark:text-dark-text-secondary/70">
          今後のアップデートで設定項目が追加される予定です
        </p>
      </div>
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-sm font-bold text-primary mt-6 mb-2 px-1">{title}</h2>
);

const SettingsCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm border border-light-divider dark:border-dark-divider overflow-hidden">
    {children}
  </div>
);

const SettingsTile = ({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 ${
        onClick ? "hover:bg-light-background dark:hover:bg-dark-background cursor-pointer" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </Wrapper>
  );
};
