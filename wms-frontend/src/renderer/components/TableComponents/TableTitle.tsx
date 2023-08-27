import React from 'react';
import { SearchBar } from '../SearchBar';

interface TableTitleProps {
  children?: React.ReactNode;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export const TableTitle = ({ children, setSearch }: TableTitleProps) => {
  return (
    <div className="sticky flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
      {children}
      <SearchBar handleSearch={(val: string) => setSearch(val)} />
    </div>
  );
};
