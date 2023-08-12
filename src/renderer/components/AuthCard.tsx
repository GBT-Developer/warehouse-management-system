import React from 'react';

export const AuthCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
        {children}
      </div>
    </div>
  );
};
