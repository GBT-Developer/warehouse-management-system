import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { BaseLayout, BaseLayoutProps } from './BaseLayout';
import { NavItem } from './Nav';

export type AppLayoutProps = Partial<BaseLayoutProps>;

const HeaderMenu = () => {
  const { logout } = useAuth().actions;

  return (
    <NavItem>
      <button
        type="button"
        className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={logout}
      >
        Logout
      </button>
    </NavItem>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check whether user is logged in or not, since navbar buttons are different for logged in user
  const { isLoggedIn } = useAuth();

  return (
    <BaseLayout headerRightMenu={isLoggedIn ? <HeaderMenu /> : <div />}>
      {children}
    </BaseLayout>
  );
};
