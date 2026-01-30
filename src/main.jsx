import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Page Components
import Dashboard from './pages/Dashboard.jsx';
import Directory from './pages/Directory.jsx';
import Profile from './pages/Profile.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
const Notifications = () => <h1>Notifications Page</h1>;
const Settings = () => <h1>Settings Page</h1>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'directory',
        element: <Directory />,
      },
      {
        path: 'profile/:studentId',
        element: <Profile />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
