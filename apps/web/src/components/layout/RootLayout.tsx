import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-background dark:bg-dark-background">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* ボトムナビゲーション */}
      <BottomNav />
    </div>
  );
};
