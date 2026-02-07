import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import Root from "./routes/root";

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
            element: <Root />,
          },
        ],
      },
    ],
  },
]);
