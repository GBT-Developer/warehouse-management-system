import React from 'react';
import { Link } from 'react-router-dom';

export type AppHeaderProps = {
  headerRightMenu: React.ReactNode;
};

export const AppHeader = ({ headerRightMenu }: AppHeaderProps) => {
  return (
    <div className="flex bg-blue-300 py-2 px-3">
      <Link to="/">
        <p className="text-2xl font-bold text-white">WMS</p>
      </Link>
      <a href="/">{headerRightMenu}</a>
    </div>
  );
};
