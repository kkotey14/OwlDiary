import React from "react";
import ReactDOM from "react-dom/client";
import {
    Navigate,
    Outlet,
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { getStoredAuthToken } from "./utils/auth";

// Page Components
import Dashboard from "./pages/Dashboard.jsx";
import Directory from "./pages/Directory.jsx";
import Profile from "./pages/Profile.jsx";
import PostPage from "./pages/PostPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "./pages/Notifications.jsx";

const ProtectedRoute = () => {
    const token = getStoredAuthToken();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

const PublicOnlyRoute = () => {
    const token = getStoredAuthToken();
    if (token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

const router = createBrowserRouter([
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/signup",
                element: <SignUpPage />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPasswordPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "directory",
                        element: <Directory />,
                    },
                    {
                        path: "profile/:studentId",
                        element: <Profile />,
                    },
                    {
                        path: "notifications",
                        element: <Notifications />,
                    },
                    {
                        path: "settings",
                        element: <Settings />,
                    },
                    {
                        path: "post/:postId",
                        element: <PostPage />,
                    },
                ],
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
