import React from 'react';

interface SingleTableItemProps {
  children: React.ReactNode;
}
export const SingleTableItem = ({ children }: SingleTableItemProps) => {
  return (
    <td className="px-4 py-3 flex-1 font-medium text-gray-900 dark:text-white max-w-xs">
      {children}
    </td>
  );
};
