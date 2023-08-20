import React, { useState } from 'react';
import { useAuth } from 'renderer/providers/AuthProvider';
import { AppHeader, AppHeaderProps } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export type BaseLayoutProps = AppHeaderProps & {
  children: React.ReactNode;
};

export const BaseLayout = ({ headerRightMenu, children }: BaseLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-y-auto">
      <AppHeader headerRightMenu={headerRightMenu} />
      {isLoggedIn && (
        <div className="z-40 fixed top-12 h-full px-2 py-4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          <AppSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
      )}

      <div
        className={`min-h-screen pt-14 ${isLoggedIn && 'ml-16'} ${
          isLoggedIn && isSidebarOpen && 'sm:ml-64'
        } transform duration-300`}
      >
        {children}
      </div>
    </div>
  );
};
