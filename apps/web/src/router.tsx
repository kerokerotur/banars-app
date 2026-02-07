import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import { EventListPage } from "./features/events/pages/EventListPage";
import { EventDetailPage } from "./features/events/pages/EventDetailPage";
import { EventCreatePage } from "./features/events/pages/EventCreatePage";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      // パブリックルート
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },

      // 認証必須ルート
      {
        element: <AuthGuard />,
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
        ],
      },
    ],
  },
]);
