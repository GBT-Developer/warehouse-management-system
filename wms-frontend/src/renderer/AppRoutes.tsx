import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  RouteProps,
  Routes,
  useLocation,
} from 'react-router-dom';
import { auth } from 'renderer/firebase';
import { AdminListPage } from './pages/AdminListPage';
import { BrokenProductListPage } from './pages/BrokenProductListPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { CreateAdminPage } from './pages/CreateAdminPage';
import CustomerListPage from './pages/CustomerListPage';
import EditCustomerPage from './pages/EditCustomerPage';
import InputCustomerPage from './pages/InputCustomer';
import InputSupplier from './pages/InputSupplier';
import { AuthPage } from './pages/LoginPage';
import { ManageProductPage } from './pages/ManageProductPage';
import { ManageStockPage } from './pages/ManageStockPage';
import { NewProductPage } from './pages/NewProductPage';
import { OnDispatchListPage } from './pages/OnDispatchListPage';
import OpnamePage from './pages/OpnamePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseReportPage from './pages/PurchaseReportPage';
import ReturnPage from './pages/ReturnPage';
import { ReturnedProductListPage } from './pages/ReturnedProductListPage';
import StockHistoryPage from './pages/StockHistoryPage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import SupplierList from './pages/SupplierList';
import TransactionHistory from './pages/TransactionHistory';
import { TransactionPage } from './pages/TransactionPage';
import { TransferItemPage } from './pages/TransferItemPage';
import VoidListPage from './pages/VoidListPage';

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
    path: '/stock-history',
    element: <StockHistoryPage />,
  },
  {
    path: '/manage-product',
    element: <ManageProductPage />,
  },
  {
    path: '/manage-product/new',
    element: <NewProductPage />,
  },
  {
    path: '/manage-product/:id/',
    element: <ProductDetailPage />,
  },
  {
    path: '/supplier-list',
    element: <SupplierList />,
  },
  {
    path: '/supplier-list/new',
    element: <InputSupplier />,
  },
  {
    path: '/supplier-list/detail/:id',
    element: <SupplierDetailPage />,
  },
  {
    path: '/supplier-list/report/:id',
    element: <PurchaseReportPage />,
  },
  {
    path: '/manage-stock',
    element: <ManageStockPage />,
  },
  {
    path: 'on-dispatch',
    element: <OnDispatchListPage />,
  },
  {
    path: '/transfer-item',
    element: <TransferItemPage />,
  },
  {
    path: '/broken-product-list-page',
    element: <BrokenProductListPage />,
  },
  {
    path: 'void-list',
    element: <VoidListPage />,
  },
  {
    path: '/transaction-page',
    element: <TransactionPage />,
  },
  {
    path: '/transaction-history',
    element: <TransactionHistory />,
  },
  {
    path: '/return-page',
    element: <ReturnPage />,
  },
  {
    path: '/returned-products',
    element: <ReturnedProductListPage />,
  },
  {
    path: '/opname-page',
    element: <OpnamePage />,
  },
  {
    path: '/customer-list',
    element: <CustomerListPage />,
  },
  {
    path: '/customer-list/:id',
    element: <EditCustomerPage />,
  },
  {
    path: '/customer-list/new',
    element: <InputCustomerPage />,
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
];

export interface AuthRequiredProps {
  children: React.ReactNode;
  to?: string;
}

export const AuthRequired = ({
  children,
  to = '/auth/login',
}: AuthRequiredProps) => {
  const { search } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Add a loading state to handle initial Firebase authentication
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set isLoading to false when Firebase authentication is done
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsLoading(false);
      if (auth.currentUser) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) return null; // Or a loading spinner, or any other loading indicator

  return (
    <>
      {isLoggedIn ? (
        children
      ) : (
        <Navigate to={`${to}?redirect=${search}`} replace />
      )}
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
