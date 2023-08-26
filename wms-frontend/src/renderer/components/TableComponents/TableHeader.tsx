import React from 'react';

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader = ({ children }: TableHeaderProps) => {
  return (
    <thead className="top-0 text-xs text-gray-500 uppercase font-bold">
      <tr>{children}</tr>
    </thead>
  );
};
