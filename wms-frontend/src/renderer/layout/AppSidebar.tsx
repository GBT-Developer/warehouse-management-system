import React, { ReactNode, useState } from 'react';
import {
  AiOutlineDatabase,
  AiOutlineHome,
  AiOutlineStop,
} from 'react-icons/ai';
import { BsBoxSeam, BsChevronDown, BsChevronUp, BsTruck } from 'react-icons/bs';
import { CiLogout } from 'react-icons/ci';
import { GiBrokenPottery } from 'react-icons/gi';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
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
        <span className="flex-1 text-start overflow-hidden whitespace-nowrap overflow-ellipsis">
          {children}
        </span>
      </button>
    </li>
  );
};

const Profile = () => {
  const { user, warehousePosition } = useAuth();
  const { setCurrentWarehouse } = useAuth().actions;
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [dataWarehouse, setDataWarehouse] = useState<
    'Gudang Bahan' | 'Gudang Jadi' | 'Semua Gudang'
  >(
    warehousePosition === 'Semua Gudang'
      ? 'Semua Gudang'
      : warehousePosition === 'Gudang Bahan'
      ? 'Gudang Bahan' // Match the type here
      : 'Gudang Jadi' // Match the type here
  );
  const warehouseOptions = [
    'Gudang Bahan',
    'Gudang Jadi',
    'Semua Gudang',
  ].filter((option) => option !== dataWarehouse);

  return (
    <div>
      <p className="text-sm text-gray-400">{user?.email}</p>
      <ul className="mt-2">
        <li>
          <button
            type="button"
            disabled={user?.role !== 'Owner'}
            className={`flex gap-2 w-full items-center p-2 text-black rounded-lg group hover:bg-gray-300
            `}
            onClick={() => {
              setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen);
            }}
          >
            <span className="flex-1 text-start overflow-hidden whitespace-nowrap overflow-ellipsis">
              {dataWarehouse}
            </span>
            <div className="flex justify-end">
              {isWarehouseDropdownOpen ? <BsChevronUp /> : <BsChevronDown />}
            </div>
          </button>
          <ul
            className={`${isWarehouseDropdownOpen ? '' : 'hidden'} space-y-2`}
          >
            {warehouseOptions
              .filter((option) => {
                if (user?.role === 'Owner') return true;
                else if (user?.role === 'Gudang Bahan')
                  return option === 'Gudang Bahan';
                else if (user?.role === 'Gudang Jadi')
                  return option === 'Gudang Jadi';
              })
              .map((option) => (
                <SidebarItem
                  key={option}
                  onClick={() => {
                    setDataWarehouse(
                      option as 'Gudang Bahan' | 'Gudang Jadi' | 'Semua Gudang'
                    );
                    let chosenWarehouse = '';
                    if (option === 'Gudang Bahan')
                      chosenWarehouse = 'Gudang Bahan';
                    else if (option === 'Gudang Jadi')
                      chosenWarehouse = 'Gudang Jadi';
                    else chosenWarehouse = 'Semua Gudang';

                    setCurrentWarehouse(chosenWarehouse);
                    setIsWarehouseDropdownOpen(false);
                  }}
                  selected={false}
                >
                  {option}
                </SidebarItem>
              ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export const AppSidebar = () => {
  const { logout } = useAuth().actions;
  const { user } = useAuth();
  const { warehousePosition } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInventDropdownOpen, setIsInventDropdownOpen] = React.useState(false);
  // Warehouse mode: raw material warehouse, finished goods warehouse, both

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="flex flex-col h-screen sidebar-bg px-2 pt-[2rem] w-1/5 "
    >
      <div className="py-4">
        <div className="flex px-3 justify-between items-center text-black">
          <Link to="/">
            <p className="text-4xl font-bold">WMS</p>
          </Link>
        </div>
        <div className="px-3">
          <Profile />
        </div>
      </div>
      <div className={'w-full mb-2 border-b border-gray-300'} />
      <div className="h-full px-3 hover:overflow-y-auto overflow-hidden">
        <p className="text-sm font-bold text-gray-500 ">Fungsi Utama</p>
        <ul className="my-3 space-y-2 font-regular">
          <SidebarItem
            onClick={() => {
              navigate('/profile');
            }}
            icon={<AiOutlineHome />}
            selected={location.pathname === '/profile'}
          >
            Beranda
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/stock-history');
            }}
            icon={<MdHistoryEdu />}
            selected={location.pathname.includes('/stock-history')}
          >
            Riwayat Stock
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/manage-product');
            }}
            icon={<LuPackageOpen />}
            selected={location.pathname.includes('/manage-product')}
          >
            Kelola Produk
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
              <span className="text-left whitespace-nowrap">Inventaris</span>
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
                  navigate('/supplier-list');
                }}
                selected={location.pathname.includes('/supplier-list')}
              >
                Data Supplier
              </SidebarItem>

              <SidebarItem
                icon={<LuFolderEdit />}
                onClick={() => {
                  navigate('/manage-stock');
                }}
                selected={location.pathname.includes('/manage-stock')}
              >
                Kelola Stock
              </SidebarItem>

              <SidebarItem
                icon={<BsTruck />}
                onClick={() => {
                  navigate('/on-dispatch');
                }}
                selected={location.pathname.includes('/on-dispatch')}
              >
                Dalam Pengiriman
              </SidebarItem>

              {warehousePosition !== 'Gudang Jadi' && (
                <SidebarItem
                  icon={<TbPackageExport />}
                  onClick={() => {
                    navigate('/transfer-item');
                  }}
                  selected={location.pathname.includes('/transfer-item')}
                >
                  Transfer Barang
                </SidebarItem>
              )}

              <SidebarItem
                icon={<GiBrokenPottery />}
                onClick={() => {
                  navigate('/broken-product-list-page');
                }}
                selected={location.pathname.includes(
                  '/broken-product-list-page'
                )}
              >
                Product Rusak
              </SidebarItem>

              {user?.role.toLocaleLowerCase() === 'owner' && (
                <SidebarItem
                  icon={<AiOutlineStop />}
                  onClick={() => {
                    navigate('/void-list');
                  }}
                  selected={location.pathname.includes('/void-list')}
                >
                  List Void
                </SidebarItem>
              )}
            </ul>
          </li>

          <SidebarItem
            onClick={() => {
              navigate('/transaction-page');
            }}
            icon={<LiaMoneyBillWaveSolid />}
            selected={location.pathname.includes('/transaction-page')}
          >
            Transaksi
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/transaction-history');
            }}
            icon={<LuHistory />}
            selected={location.pathname.includes('/transaction-history')}
          >
            Riwayat Transaksi
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/return-page');
            }}
            icon={<TbTruckReturn />}
            selected={location.pathname.includes('/return-page')}
          >
            Pengembalian
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/returned-products');
            }}
            icon={<MdOutlineAssignmentReturn />}
            selected={location.pathname.includes('/returned-products')}
          >
            Retur Produk Supplier
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/opname-page');
            }}
            icon={<BsBoxSeam />}
            selected={location.pathname.includes('/opname-page')}
          >
            Opname
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              navigate('/customer-list');
            }}
            icon={<MdOutlinePeopleAlt />}
            selected={location.pathname.includes('/customer-list')}
          >
            Customer
          </SidebarItem>
        </ul>

        <p className="text-sm font-bold text-gray-500 ">Administrasi</p>
        <ul className="my-3 space-y-2 font-regular">
          {user?.role.toLocaleLowerCase() === 'owner' && (
            <SidebarItem
              icon={<PiUserListLight />}
              onClick={() => {
                navigate('/adminlistpage');
              }}
              selected={location.pathname.includes('/adminlistpage')}
            >
              List Admin
            </SidebarItem>
          )}
          <SidebarItem
            icon={<PiPasswordLight />}
            onClick={() => {
              navigate('/changepassword');
            }}
            selected={location.pathname.includes('/changepassword')}
          >
            Ubah Password
          </SidebarItem>
          <SidebarItem
            icon={<CiLogout />}
            onClick={logout}
            selected={location.pathname === '/'}
          >
            Keluar
          </SidebarItem>
        </ul>
      </div>
    </aside>
  );
};
