import React from 'react';

export type PageProps = React.HTMLAttributes<HTMLDivElement>;

export const Page = ({ children, ...divProps }: PageProps) => (
  <div className="flex flex-col bg-green-300" {...divProps}>
    {children}
  </div>
);
