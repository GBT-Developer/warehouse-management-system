import { Route, RouteProps, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { Hello } from './components/Hello';
import Profile from './components/Profile';

type RouteConfig = RouteProps & {
  isPrivate?: boolean;
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <AuthPage />,
    index: true,
  },
  {
    path: '/homepage',
    element: <AuthPage />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
];

const renderRouteMap = ({ element, ...restRoute }: RouteConfig) => {
  return <Route key={restRoute.path} element={element} {...restRoute} />;
};

export const AppRoutes = () => {
  return <Routes>{routes.map((route) => renderRouteMap(route))}</Routes>;
};
