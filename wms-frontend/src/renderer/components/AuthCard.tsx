import React from 'react';

export const AuthCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg min-w-[15rem]">
      {children}
    </div>
  );
};
