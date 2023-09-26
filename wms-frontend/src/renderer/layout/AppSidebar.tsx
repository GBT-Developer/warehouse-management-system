import React, { ReactNode } from 'react';
import {
  AiOutlineDatabase,
  AiOutlineHome,
  AiOutlineStop,
} from 'react-icons/ai';
import { BsBoxSeam, BsChevronDown, BsChevronUp, BsTruck } from 'react-icons/bs';
import { CiLogout } from 'react-icons/ci';
import { GiBrokenPottery } from 'react-icons/gi';
import {
  LiaFileInvoiceDollarSolid,
  LiaMoneyBillWaveSolid,
} from 'react-icons/lia';
import { LuFolderEdit, LuHistory, LuPackageOpen } from 'react-icons/lu';
import {
  MdHistoryEdu,
  MdInventory2,
  MdOutlineAssignmentReturn,
  MdOutlinePeopleAlt,
} from 'react-icons/md';
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

export const AppSidebar = () => {
  const { logout } = useAuth().actions;
  const navigate = useNavigate();
  const location = useLocation();
  const [isInventDropdownOpen, setIsInventDropdownOpen] = React.useState(false);

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="flex flex-col h-screen sidebar-bg min-w-[16rem] px-2 pt-[2rem] w-1/5 "
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
        <div className="flex px-2.5 py-1.5 justify-between items-center text-black">
          <button className="text-black hover:bg-gray-500 hover:text-white focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-xs px-2.5 py-1.5 w-1/4">
            Gudang Jadi
          </button>
          <button className="text-black hover:bg-gray-500 hover:text-white focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-xs px-2.5 py-1.5 w-1/4">
            Gudang Bahan
          </button>
          <button className="text-black hover:bg-gray-500 hover:text-white focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-xs px-2.5 py-1.5 w-1/4">
            Semua Gudang
          </button>
        </div>
      </div>
      <div className="h-full px-3 hover:overflow-y-auto overflow-clip">
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
              navigate('/stockhistory');
            }}
            icon={<MdHistoryEdu />}
            selected={location.pathname === '/stockhistory'}
          >
            Stock History
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
                icon={<BsTruck />}
                onClick={() => {
                  navigate('/on-dispatch');
                }}
                selected={location.pathname === '/on-dispatch'}
              >
                On Dispatch
              </SidebarItem>

              <SidebarItem
                icon={<TbPackageExport />}
                onClick={() => {
                  navigate('/transfer-item');
                }}
                selected={location.pathname === '/transfer-item'}
              >
                Transfer Item
              </SidebarItem>

              <SidebarItem
                icon={<GiBrokenPottery />}
                onClick={() => {
                  navigate('/broken-product-list-page');
                }}
                selected={location.pathname === '/broken-product-list-page'}
              >
                Broken Products
              </SidebarItem>
              <SidebarItem
                icon={<AiOutlineStop />}
                onClick={() => {
                  navigate('/void-list');
                }}
                selected={location.pathname === '/void-list'}
              >
                Void List
              </SidebarItem>
            </ul>
          </li>

          <SidebarItem
            onClick={() => {
              navigate('/transactionpage');
            }}
            icon={<LiaMoneyBillWaveSolid />}
            selected={location.pathname === '/transactionpage'}
          >
            Transaction
          </SidebarItem>

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
              navigate('/returnpage');
            }}
            icon={<TbTruckReturn />}
            selected={location.pathname === '/returnpage'}
          >
            Return
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/returnedproducts');
            }}
            icon={<MdOutlineAssignmentReturn />}
            selected={location.pathname === '/returnedproducts'}
          >
            Returned Products
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/opnamepage');
            }}
            icon={<BsBoxSeam />}
            selected={location.pathname === '/'}
          >
            Opname
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/customer-list');
            }}
            icon={<MdOutlinePeopleAlt />}
            selected={location.pathname === '/customer-list'}
          >
            Customer
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
