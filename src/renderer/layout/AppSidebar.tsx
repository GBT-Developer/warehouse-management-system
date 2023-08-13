import React, { ReactNode } from 'react';
import { GoPackageDependents } from 'react-icons/go';
import { AiOutlineHome } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon: ReactNode;
  isSidebarOpen: boolean;
}

const SidebarItem = ({
  children,
  onClick,
  icon,
  isSidebarOpen,
}: SidebarItemProps) => {
  return (
    <li>
      <button
        type="button"
        className={`flex w-full items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group duration-500 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={onClick}
      >
        {icon}
        <span className="flex-1 ml-3 text-start whitespace-nowrap">
          {children}
        </span>
      </button>
    </li>
  );
};

export const SidebarButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      aria-controls="sidebar-multi-level"
      aria-expanded="false"
      onClick={onClick}
    >
      <svg
        className="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          fillRule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        />
      </svg>
    </button>
  );
};

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className={` fixed top-12 left-0 z-40 w-64 h-screen bg-gray-50 dark:bg-gray-900 duration-300 transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-48'
      } border-r border-gray-200 dark:border-gray-700`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-end">
          <SidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div
          className={`w-full my-2 border-b border-gray-200 dark:border-gray-700 duration-500 transition-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
        <ul className="space-y-2 font-medium">
          <SidebarItem
            onClick={() => navigate('/profile')}
            icon={<AiOutlineHome />}
            isSidebarOpen={isSidebarOpen}
          >
            Home
          </SidebarItem>
          <SidebarItem
            onClick={() => navigate('/inputpage')}
            icon={<GoPackageDependents />}
            isSidebarOpen={isSidebarOpen}
          >
            Input Stock
          </SidebarItem>
        </ul>
      </div>
    </aside>
  );
};
