import React, { ReactNode } from 'react';
import { GoPackageDependents } from 'react-icons/go';
import { AiOutlineHome } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

interface SidebarItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
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
        className={`flex gap-2 w-full items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group duration-500 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={onClick}
      >
        {icon}
        <span className="flex-1 text-start whitespace-nowrap">{children}</span>
      </button>
    </li>
  );
};

export const SidebarButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      onClick={onClick}
    >
      <svg
        className="w-6 h-6"
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
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className={` fixed top-12 left-0 z-40 w-64 h-screen bg-gray-50 dark:bg-gray-900 duration-300 transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-48'
      } border-r border-gray-200 dark:border-gray-700`}
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
            Beranda
          </SidebarItem>
          <li
            className={`duration-500 transition-transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <button
              type="button"
              className="flex gap-2 mb-2 items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <p>
                <GoPackageDependents />
              </p>
              <span className="text-left whitespace-nowrap">Input Stock</span>
              <div className="flex justify-end w-full">
                {isDropdownOpen ? <BsChevronUp /> : <BsChevronDown />}
              </div>
            </button>

            <ul className={`${isDropdownOpen ? '' : 'hidden'} space-y-2 pl-5`}>
              <SidebarItem
                isSidebarOpen={isSidebarOpen}
                onClick={() => navigate('/manage-product')}
              >
                Kelola Produk
              </SidebarItem>
              <SidebarItem
                isSidebarOpen={isSidebarOpen}
                onClick={() => navigate('/manage-stock')}
              >
                Penyesuaian Stock
              </SidebarItem>
            </ul>
          </li>
        </ul>
      </div>
    </aside>
  );
};
