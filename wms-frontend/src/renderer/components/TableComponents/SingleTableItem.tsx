import React from 'react';

interface SingleTableItemProps {
  children: React.ReactNode;
}
export const SingleTableItem = ({ children }: SingleTableItemProps) => {
  return (
    <td className=" py-3 flex-1 font-medium text-gray-900 max-w-xs">
      {children}
    </td>
  );
};
