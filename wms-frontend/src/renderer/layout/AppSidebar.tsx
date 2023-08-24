import React, { ReactNode } from 'react';
import { AiOutlineDatabase, AiOutlineHome } from 'react-icons/ai';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { LuFolderEdit, LuHistory, LuPackageOpen } from 'react-icons/lu';
import { MdInventory2 } from 'react-icons/md';
import { PiPasswordLight, PiUserListLight } from 'react-icons/pi';
import { SiAzureartifacts } from 'react-icons/si';
import { TbPackageExport, TbTruckReturn } from 'react-icons/tb';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'renderer/providers/AuthProvider';

interface SidebarItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  selected: boolean;
}

const SidebarItem = ({
  children,
  onClick,
  icon,
  selected,
}: SidebarItemProps) => {
  return (
    <li>
      <button
        type="button"
        className={`flex gap-2 w-full items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group duration-500 transition-transform
        ${selected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        onClick={onClick}
      >
        {icon}
        <span className="flex-1 text-start whitespace-nowrap">{children}</span>
      </button>
    </li>
  );
};

const Profile = () => {
  const { user } = useAuth();
  return <p className="text-sm text-gray-400">{user?.email}</p>;
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
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isInventDropdownOpen, setIsInventDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className={
        'fixed left-0 z-40 w-64 h-screen bg-gray-50 dark:bg-gray-900 duration-300 transition-transform border-r border-gray-200 dark:border-gray-700'
      }
    >
      <div className="py-6">
        <div className="flex px-3 bg-transparent dark:bg-transparent justify-between items-center text-black dark:text-white">
          <Link to="/">
            <p className="text-4xl font-bold">WMS</p>
          </Link>
        </div>
        <div className="py-1 px-3 bg-transparent">
          <Profile />
        </div>
      </div>
      <div className="h-full px-3  overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div
          className={
            'w-full my-2 border-b border-gray-200 dark:border-gray-700'
          }
        />
        <p className="text-sm font-bold text-gray-400 ">Main Functions</p>
        <ul className="my-3 space-y-2 font-medium">
          <SidebarItem
            onClick={() => {
              navigate('/profile');
            }}
            icon={<AiOutlineHome />}
            selected={location.pathname === '/profile'}
          >
            Home
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/');
            }}
            icon={<SiAzureartifacts />}
            selected={location.pathname === '/'}
          >
            Suppliers
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/manage-product');
            }}
            icon={<LuPackageOpen />}
            selected={location.pathname === '/manage-product'}
          >
            Manage Product
          </SidebarItem>

          <li>
            <button
              type="button"
              className="flex gap-2 mb-2 items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              onClick={() => setIsInventDropdownOpen(!isInventDropdownOpen)}
            >
              <p>
                <MdInventory2 />
              </p>
              <span className="text-left whitespace-nowrap">Inventory</span>
              <div className="flex justify-end w-full">
                {isInventDropdownOpen ? <BsChevronUp /> : <BsChevronDown />}
              </div>
            </button>
            <ul
              className={`${
                isInventDropdownOpen ? '' : 'hidden'
              } space-y-2 pl-5`}
            >
              <SidebarItem
                icon={<AiOutlineDatabase />}
                onClick={() => {
                  navigate('/inputsupplier');
                }}
                selected={location.pathname === '/inputsupplier'}
              >
                Supplier Data
              </SidebarItem>

              <SidebarItem
                icon={<LuFolderEdit />}
                onClick={() => {
                  navigate('/manage-stock');
                }}
                selected={location.pathname === '/manage-stock'}
              >
                Manage Stock
              </SidebarItem>

              <SidebarItem
                icon={<TbPackageExport />}
                onClick={() => {
                  navigate('/');
                }}
                selected={location.pathname === '/'}
              >
                Transfer Item
              </SidebarItem>
            </ul>
          </li>

          <SidebarItem
            onClick={() => {
              navigate('/');
            }}
            icon={<LuHistory />}
            selected={location.pathname === '/'}
          >
            Transaction History
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/');
            }}
            icon={<LiaFileInvoiceDollarSolid />}
            selected={location.pathname === '/'}
          >
            Invoice
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/');
            }}
            icon={<TbTruckReturn />}
            selected={location.pathname === '/'}
          >
            Retoure
          </SidebarItem>
        </ul>

        <p className="text-sm font-bold text-gray-400 ">Administrative</p>
        <ul className="my-3 space-y-2 font-medium">
          <SidebarItem
            icon={<PiUserListLight />}
            onClick={() => {
              navigate('/adminlistpage');
            }}
            selected={location.pathname === '/adminlistpage'}
          >
            Admin List
          </SidebarItem>
          <SidebarItem
            icon={<PiPasswordLight />}
            onClick={() => {
              navigate('/changepassword');
            }}
            selected={location.pathname === '/changepassword'}
          >
            Change Password
          </SidebarItem>
          <SidebarItem
            icon={<PiPasswordLight />}
            onClick={() => {
              navigate('/changepassword');
            }}
            selected={location.pathname === '/'}
          >
            Logout
          </SidebarItem>
        </ul>
      </div>
    </aside>
  );
};
