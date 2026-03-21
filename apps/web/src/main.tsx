import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { startLiffInit } from "./lib/liff";
import { router } from "./router";
import { useThemeStore } from "./stores/theme";
import "./styles.css";

// React Router が認証コールバック URL パラメータを strip する前に
// LIFF SDK が処理できるよう、ルーティング前に init を開始する
startLiffInit();

// 保存済みテーマを DOM に反映（フラッシュ防止）
useThemeStore.getState().initializeTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間キャッシュ
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
