import React from 'react';
import { useAuth } from 'renderer/providers/AuthProvider';
import { AppSidebar } from './AppSidebar';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex w-screen h-screen page-bg text-black overflow-y-auto">
      {isLoggedIn && <AppSidebar />}

      <div className={`min-h-screen ${isLoggedIn ? 'w-4/5' : 'w-full'}`}>
        {children}
      </div>
    </div>
  );
};
