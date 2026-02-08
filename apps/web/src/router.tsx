import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import { EventListPage } from "./features/events/pages/EventListPage";
import { EventDetailPage } from "./features/events/pages/EventDetailPage";
import { EventCreatePage } from "./features/events/pages/EventCreatePage";
import { SchedulePage } from "./features/schedule/pages/SchedulePage";
import { MemberListPage } from "./features/members/pages/MemberListPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { RootLayout } from "./components/layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      // パブリックルート（レイアウトなし）
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },

      // 認証必須ルート（RootLayoutを適用）
      {
        element: <AuthGuard />,
        children: [
          {
            element: <RootLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="/events" replace />,
              },
              {
                path: "events",
                children: [
                  { index: true, element: <EventListPage /> },
                  { path: "new", element: <EventCreatePage /> },
                  { path: ":eventId", element: <EventDetailPage /> },
                ],
              },
              {
                path: "schedule",
                element: <SchedulePage />,
              },
              {
                path: "members",
                element: <MemberListPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
