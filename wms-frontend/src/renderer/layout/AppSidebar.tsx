import React, { ReactNode } from 'react';
import { AiOutlineDatabase, AiOutlineHome } from 'react-icons/ai';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { CiLogout } from 'react-icons/ci';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { LuFolderEdit, LuHistory, LuPackageOpen } from 'react-icons/lu';
import { MdInventory2 } from 'react-icons/md';
import { PiPasswordLight, PiUserListLight } from 'react-icons/pi';
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
        className={`flex gap-2 w-full items-center p-2 text-black rounded-lg group
        ${selected ? 'bg-white' : 'hover:bg-gray-300'}`}
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
  const { logout } = useAuth().actions;
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isInventDropdownOpen, setIsInventDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="flex flex-col h-screen sidebar-bg min-w-[16rem] px-2 pt-[2rem] w-1/5"
    >
      <div className="py-6">
        <div className="flex px-3 justify-between items-center text-black">
          <Link to="/">
            <p className="text-4xl font-bold">WMS</p>
          </Link>
        </div>
        <div className="px-3">
          <Profile />
        </div>
      </div>
      <div className="h-full px-3 overflow-y-auto">
        <div className={'w-full my-2 border-b border-gray-300'} />
        <p className="text-sm font-bold text-gray-500 ">Main Functions</p>
        <ul className="my-3 space-y-2 font-regular">
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
              className="flex gap-2 mb-2 items-center w-full p-2 text-base text-black rounded-lg group hover:bg-gray-300"
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
                  navigate('/supplierlist');
                }}
                selected={location.pathname === '/supplierlist'}
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
              navigate('/transactionhistory');
            }}
            icon={<LuHistory />}
            selected={location.pathname === '/transactionhistory'}
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

        <p className="text-sm font-bold text-gray-500 ">Administrative</p>
        <ul className="my-3 space-y-2 font-regular">
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
            icon={<CiLogout />}
            onClick={logout}
            selected={location.pathname === '/'}
          >
            Logout
          </SidebarItem>
        </ul>
      </div>
    </aside>
  );
};
