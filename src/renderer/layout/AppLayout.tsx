import React from 'react';
import { NavItem } from './Nav';
import { BaseLayout, BaseLayoutProps } from './BaseLayout';
import { useAuth } from '../providers/AuthProvider';

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

export const AppLayout = (props: AppLayoutProps) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // check whether user is logged in or not, since navbar buttons are different for logged in user
  const { isLoggedIn } = useAuth();

  return (
    <BaseLayout
      headerRightMenu={isLoggedIn ? <HeaderMenu /> : <div />}
      {...props}
    />
  );
};
