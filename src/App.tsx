import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage, { loginAction } from './Auth/Login';
import RegistrationPage, { registrationAction } from './Auth/Registration';
import AuthRoot from './Auth';
import ErrorPage from './ErrorPage';
import Layout from './Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/auth',
    element: <AuthRoot />,
    // loader: authLoader,
    children: [
      { path: 'login', element: <LoginPage />, action: loginAction },
      {
        path: 'registration',
        element: <RegistrationPage />,
        action: registrationAction,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
