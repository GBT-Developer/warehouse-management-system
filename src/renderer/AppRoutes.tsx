import { Route, RouteProps, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { InputPage } from './pages/InputPage';
import { Hello } from './components/Hello';

type RouteConfig = RouteProps & {
  isPrivate?: boolean;
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Hello />,
    index: true,
  },
  {
    path: '/homepage',
    element: <AuthPage />,
  },
  {
    path: '/inputpage',
    element: <InputPage />,
  },
];

const renderRouteMap = ({ element, ...restRoute }: RouteConfig) => {
  return <Route key={restRoute.path} element={element} {...restRoute} />;
};

export const AppRoutes = () => {
  return <Routes>{routes.map((route) => renderRouteMap(route))}</Routes>;
};
