import React, { HTMLAttributes } from 'react';

export const Nav = (props: HTMLAttributes<HTMLUListElement>) => {
  return <ul {...props} className="flex justify-center" />;
};

export const NavItem = (props: HTMLAttributes<HTMLLIElement>) => {
  return <li {...props} className="flex items-center space-x-2" />;
};

export interface NavButtonProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const NavButton = ({ icon, children, ...props }: NavButtonProps) => {
  return (
    <button
      type="button"
      {...props}
      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded"
    >
      {icon}
      {children}
    </button>
  );
};

NavButton.defaultProps = {
  icon: <div />,
};

export interface NavLinkProps extends HTMLAttributes<HTMLAnchorElement> {}

export const NavLink = ({ children, ...linkProps }: NavLinkProps) => {
  return (
    <a
      {...linkProps}
      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded"
    >
      {children}
    </a>
  );
};
