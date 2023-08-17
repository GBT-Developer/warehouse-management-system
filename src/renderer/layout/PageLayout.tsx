import React from 'react';

export type PageProps = React.HTMLAttributes<HTMLDivElement> & {
  isSidebarOpen?: boolean;
};

export const PageLayout = ({ children, ...divProps }: PageProps) => (
  <div
    className="flex flex-col h-full items-center p-4 overflow-y-auto"
    {...divProps}
  >
    {children}
  </div>
);
