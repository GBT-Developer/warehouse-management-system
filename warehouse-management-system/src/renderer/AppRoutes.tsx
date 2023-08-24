import { auth } from 'firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  RouteProps,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AdminListPage } from './pages/AdminListPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { CreateAdminPage } from './pages/CreateAdminPage';
import InputSupplier from './pages/InputSupplier';
import { AuthPage } from './pages/LoginPage';
import { ManageProductPage } from './pages/ManageProductPage';
import { ManageStockPage } from './pages/ManageStockPage';
import ProfilePage from './pages/ProfilePage';
import StockHistory from './pages/StockHistory';
import SupplierList from './pages/SupplierList';
import TransactionHistory from './pages/TransactionHistory';
import { useAuth } from './providers/AuthProvider';

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
    element: <AdminListPage />,
  },
  {
    path: '/changepassword',
    element: <ChangePasswordPage />,
  },
  {
    path: '/stockhistory',
    element: <StockHistory />,
  },
  {
    path: '/supplierlist',
    element: <SupplierList />,
  },
  {
    path: '/transactionhistory',
    element: <TransactionHistory />,
  },
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

  // Add a loading state to handle initial Firebase authentication
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set isLoading to false when Firebase authentication is done
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner, or any other loading indicator
  }

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
