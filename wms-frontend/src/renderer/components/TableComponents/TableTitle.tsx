import React from 'react';
import { SearchBar } from '../SearchBar';

interface TableTitleProps {
  children?: React.ReactNode;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}

export const TableTitle = ({
  children,
  setSearch,
  placeholder,
}: TableTitleProps) => {
  return (
    <div className="sticky flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
      {children}
      <SearchBar
        placeholder={placeholder}
        handleSearch={(val: string) => setSearch(val)}
      />
    </div>
  );
};
