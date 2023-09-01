import React from 'react';
import { useAuth } from 'renderer/providers/AuthProvider';

export type PageProps = React.HTMLAttributes<HTMLDivElement> & {
  isSidebarOpen?: boolean;
};

export const PageLayout = ({ children, ...divProps }: PageProps) => {
  const { isLoggedIn } = useAuth();
  return (
    <div
      className={`flex flex-col h-full overflow-y-auto ${
        isLoggedIn ? 'pl-4 pr-4 pt-[5rem] pb-4' : ''
      }`}
      {...divProps}
    >
      {children}
    </div>
  );
};
