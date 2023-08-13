import React from 'react';

export type PageProps = React.HTMLAttributes<HTMLDivElement> & {
  isSidebarOpen?: boolean;
};

export const Page = ({ children, isSidebarOpen, ...divProps }: PageProps) => (
  <div
    className={`flex flex-col h-full items-center p-4 mt-14 ${
      isSidebarOpen ? 'sm:ml-64' : 'sm:ml-16'
    } overflow-y-auto`}
    {...divProps}
  >
    {children}
  </div>
);
