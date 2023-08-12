import React from 'react';

export type PageProps = React.HTMLAttributes<HTMLDivElement>;

export const Page = ({ children, ...divProps }: PageProps) => (
  <div className="flex flex-col h-full px-3 items-center" {...divProps}>
    {children}
  </div>
);
