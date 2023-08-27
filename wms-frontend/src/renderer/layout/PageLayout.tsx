import React from 'react';

export type PageProps = React.HTMLAttributes<HTMLDivElement> & {
  isSidebarOpen?: boolean;
};

export const PageLayout = ({ children, ...divProps }: PageProps) => (
  <div
    className="flex flex-col h-full pl-[3rem] pr-4 pt-[5rem] pb-4 overflow-y-auto"
    {...divProps}
  >
    {children}
  </div>
);
