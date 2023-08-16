import React from 'react';
import {
  Navigate,
  Route,
  RouteProps,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthPage } from './pages/LoginPage';
import { useAuth } from './providers/AuthProvider';
import ProfilePage from './pages/ProfilePage';
import { CreateAdminPage } from './pages/CreateAdminPage';
import List from './pages/AdminListPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import InputSupplier from './pages/InputSupplier';
import { ManageProductPage } from './pages/ManageProductPage';
import { ManageStockPage } from './pages/ManageStockPage';

type RouteConfig = RouteProps & {
  isPrivate?: boolean;
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/profile" replace />,
    isPrivate: true,
    index: true,
  },
  {
    path: '/auth/login',
    element: <AuthPage />,
    isPrivate: false,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/manage-product',
    element: <ManageProductPage />,
  },
  {
    path: '/manage-stock',
    element: <ManageStockPage />,
  },
  {
    path: '/inputsupplier',
    element: <InputSupplier />,
  },
  {
    path: '/createadminpage',
    element: <CreateAdminPage />,
  },
  {
    path: '/adminlistpage',
    element: <List />,
  },
  {
    path: '/changepassword',
    element: <ChangePasswordPage />,
  }
];

export type AuthRequiredProps = {
  children: React.ReactNode;
  to?: string;
};

export const AuthRequired = ({
  children,
  to = '/auth/login',
}: AuthRequiredProps) => {
  const { isLoggedIn } = useAuth();
  const { search } = useLocation();

  return (
    <>
      {isLoggedIn && children}
      {!isLoggedIn && <Navigate to={to} state={{ from: search }} replace />}
    </>
  );
};

AuthRequired.defaultProps = {
  to: '/auth/login',
};

const renderRouteMap = ({ isPrivate, element, ...restRoute }: RouteConfig) => {
  const authRequiredElement = isPrivate ? (
    <AuthRequired>{element}</AuthRequired>
  ) : (
    element
  );
  return (
    <Route key={restRoute.path} element={authRequiredElement} {...restRoute} />
  );
};

export const AppRoutes = () => {
  return <Routes>{routes.map((route) => renderRouteMap(route))}</Routes>;
};
