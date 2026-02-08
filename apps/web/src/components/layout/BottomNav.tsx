import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Plus } from "lucide-react";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-light-surface dark:bg-dark-surface border-t border-light-divider dark:border-dark-divider shadow-lg">
      <div className="h-16 flex items-center justify-around px-4">
        {/* ホームタブ */}
        <NavItem
          path="/events"
          icon={Home}
          activeIcon={Home}
          label="ホーム"
          isActive={isActive("/events")}
        />

        {/* 中央の+ボタン */}
        <button
          onClick={() => navigate("/events/new")}
          className="w-14 h-14 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
          aria-label="イベント作成"
        >
          <Plus size={28} className="text-white" />
        </button>

        {/* 予定タブ */}
        <NavItem
          path="/schedule"
          icon={Calendar}
          activeIcon={Calendar}
          label="予定"
          isActive={isActive("/schedule")}
        />
      </div>
    </nav>
  );
};

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem = ({ path, icon: Icon, activeIcon: ActiveIcon, label, isActive }: NavItemProps) => {
  const IconComponent = isActive ? ActiveIcon : Icon;

  return (
    <Link
      to={path}
      className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl hover:bg-light-background dark:hover:bg-dark-background transition-colors min-w-[80px]"
    >
      <IconComponent
        size={24}
        className={
          isActive
            ? "text-primary font-bold"
            : "text-light-text-secondary dark:text-dark-text-secondary"
        }
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span
        className={`text-xs ${
          isActive
            ? "text-primary font-semibold"
            : "text-light-text-secondary dark:text-dark-text-secondary"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};
