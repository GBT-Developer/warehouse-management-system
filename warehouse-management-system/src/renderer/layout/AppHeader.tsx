import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from './Nav';

export type AppHeaderProps = {
  headerRightMenu: React.ReactNode;
};

export const AppHeader = ({ headerRightMenu }: AppHeaderProps) => {
  return (
    <div className="fixed top-0 z-50 h-lg w-full bg-white border-b border-gray-200 dark:border-gray-700 flex py-2 px-3 bg-gray-300 dark:bg-gray-800 justify-between items-center text-black dark:text-white">
      <Link to="/">
        <p className="text-2xl font-bold">WMS</p>
      </Link>
      <Nav className="flex space-x-2">{headerRightMenu}</Nav>
    </div>
  );
};
