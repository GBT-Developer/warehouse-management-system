import { Link } from 'react-router-dom';
import React from 'react';
import { BaseLayout, BaseLayoutProps } from './BaseLayout';
import { useAuth } from '../providers/AuthProvider';

export type AppLayoutProps = Partial<BaseLayoutProps>;

export const AppLayout = (props: AppLayoutProps) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // check whether user is logged in or not, since navbar buttons are different for logged in user
  const { isLoggedIn } = useAuth();
  const HeaderRightMenu = isLoggedIn
    ? [
        <Link to="/profile" key="profile">
          Profile
        </Link>,
        <Link to="/logout" key="logout">
          Logout
        </Link>,
      ]
    : null;
  return <BaseLayout headerRightMenu={HeaderRightMenu} {...props} />;
};
