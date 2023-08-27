import React, { useState } from 'react';
import { useAuth } from 'renderer/providers/AuthProvider';
import { AppHeaderProps } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export type BaseLayoutProps = AppHeaderProps & {
  children: React.ReactNode;
};

export const BaseLayout = ({ headerRightMenu, children }: BaseLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { isLoggedIn } = useAuth();

  return (
    <div className="flex w-screen h-screen page-bg text-black overflow-y-auto">
      {isLoggedIn && (
        <AppSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      <div className={`min-h-screen ${isLoggedIn ? 'w-4/5' : 'w-full'}`}>
        {children}
      </div>
    </div>
  );
};
