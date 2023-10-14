import { format } from 'date-fns';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiFillEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { StockHistory } from 'renderer/interfaces/StockHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
export default function ProductDetailPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [product, setProduct] = useState<Product>();
  const [editToggle, setEditToggle] = useState(false);
  const warehouseOptionRef = useRef<HTMLSelectElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supplierOptionRef = useRef<HTMLSelectElement>(null);
  const [suppliers, setSupplier] = useState<Supplier[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      'yyyy-MM-dd'
    )
  );
  // Take the last date of the month as the end date
  const [endDate, setEndDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      'yyyy-MM-dd'
    )
  );
  const successNotify = () =>
    toast.success('Detail Produk berhasil diubah', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Detail Product gagal diubah', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (param.id === undefined) return;
        const productRef = doc(db, 'product', param.id);
        const theProduct = await getDoc(productRef);
        const productData = theProduct.data() as Product;
        productData.id = theProduct.id;
        setProduct(productData);

        // Fetch supplier
        const supplierQeury = query(collection(db, 'supplier'));
        const supplierQuerySnapshot = await getDocs(supplierQeury);

        const supplierList: Supplier[] = [];
        supplierQuerySnapshot.forEach((theSupplier) => {
          const supplierData = theSupplier.data() as Supplier;
          supplierData.id = theSupplier.id;
          supplierList.push(supplierData);
        });
        const supplierOfTheProduct = supplierList.find((supplier) => {
          return supplier.id === productData.supplier;
        });
        setSupplier(supplierList);
        if (supplierOfTheProduct === undefined) {
          setLoading(false);
          return;
        }
        setProduct((prev) => {
          if (prev === undefined) return;
          return {
            ...prev,
            supplier: supplierOfTheProduct,
          };
        });

        // Fetch stock history
        const stockHistoryQuery = query(
          collection(db, 'stock_history'),
          where('product', '==', productRef.id)
        );
        const stockHistoryQuerySnapshot = await getDocs(stockHistoryQuery);

        const stockHistoryData: StockHistory[] = [];
        stockHistoryQuerySnapshot.forEach((theStockHistory) => {
          const stockHistory = theStockHistory.data() as StockHistory;
          if (stockHistory.created_at === undefined) return;
          stockHistory.id = theStockHistory.id;
          stockHistoryData.push(stockHistory);
        });
        setStockHistory(stockHistoryData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // If one or more fields are empty, return early
    if (!product) return;
    if (
      product.brand === '' ||
      product.motor_type === '' ||
      product.part === '' ||
      (product.available_color === '' &&
        product.warehouse_position !== 'Gudang Bahan') ||
      product.warehouse_position === '' ||
      product.count === undefined ||
      product.sell_price === undefined ||
      product.warehouse_position === '' ||
      product.supplier === undefined
    ) {
      setErrorMessage('Mohon isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (
      Number.isNaN(Number(product.sell_price)) ||
      Number.isNaN(Number(product.count)) ||
      Number(product.sell_price) < 0 ||
      Number(product.count) < 0
    ) {
      setErrorMessage('Harga atau jumlah barang tidak valid');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (!product.id) return;
    const productRef = doc(db, 'product', product.id);
    const updatedProduct = {
      ...product,
      brand: product.brand,
      motor_type: product.motor_type,
      part: product.part,
      available_color: product.available_color,
      count: product.count,
      sell_price: product.sell_price,
      warehouse_position: product.warehouse_position,
      supplier: product.supplier.id,
    };

    setLoading(true);

    updateDoc(productRef, updatedProduct).catch((error) => {
      console.log(error);
      failNotify();
    });

    setLoading(false);
    successNotify();
    setEditToggle(false);
  }

  const handleDeleteProduct = async () => {
    if (!product || !product.id) return;

    const productRef = doc(db, 'product', product.id);
    setLoading(true);
    try {
      await deleteDoc(productRef);
      navigate(-1);
    } catch (error) {
      console.log(error);
      failNotify(error as unknown as string);
    }
    setLoading(false);
  };

  return (
    <PageLayout>
      <div className="flex w-2/3 flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
        <div className="flex w-2/3 flex-col md:flex-row">
          <button
            type="button"
            className="pr-6 font-2xl  text-gray-600 focus:ring-4 focus:ring-gray-300 rounded-lg text-sm w-[max-content] flex justify-center gap-2 text-center items-center"
            onClick={() => navigate(-1)}
          >
            <IoChevronBackOutline size={40} /> {/* Icon */}
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Detail Produk
          </h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 font-medium text-black bg-white border border-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
          onClick={() => setEditToggle(!editToggle)}
        >
          {editToggle ? (
            <>
              Batal
              <GiCancel />
            </>
          ) : (
            <>
              Edit Produk
              <AiFillEdit />
            </>
          )}
        </button>
      </div>
      <div className="w-full h-full bg-transparent">
        <div className="relative sm:rounded-lg h-full flex flex-col justify-between">
          <form
            onSubmit={handleSubmit}
            className={`w-2/3 flex flex-col gap-3 relative ${
              loading ? 'p-2' : ''
            } transform transition-all duration-300`}
          >
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <InputField
              loading={loading || !editToggle}
              labelFor="brand"
              label="Merek"
              value={product?.brand ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, brand: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="type"
              label="Tipe Motor"
              value={product?.motor_type ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, motor_type: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="part"
              label="Part"
              value={product?.part ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, part: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            {product?.warehouse_position !== 'Gudang Bahan' && (
              <InputField
                loading={loading || !editToggle}
                labelFor="available_color"
                label="Warna"
                value={product?.available_color ?? ''}
                onChange={(e) => {
                  if (product === undefined) return;
                  setProduct({ ...product, available_color: e.target.value });
                }}
                additionalStyle={`${
                  editToggle ? '' : 'border-none outline-none bg-inherit'
                }`}
              />
            )}
            <InputField
              loading={true}
              labelFor="count"
              label="Jumlah Produk"
              value={product?.count ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, count: Number(e.target.value) });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="sell_price"
              label="Harga Jual"
              value={
                editToggle
                  ? product?.sell_price ?? ''
                  : product
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(product.sell_price)
                  : ''
              }
              onChange={(e) => {
                if (
                  !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                  e.target.value !== ''
                )
                  return;
                if (product === undefined) return;
                setProduct({ ...product, sell_price: Number(e.target.value) });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="purchase_price"
              label="Harga Beli"
              value={
                editToggle
                  ? product?.purchase_price ?? ''
                  : product
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(product.purchase_price)
                  : ''
              }
              onChange={(e) => {
                if (
                  !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                  e.target.value !== ''
                )
                  return;
                if (product === undefined) return;
                setProduct({
                  ...product,
                  purchase_price: Number(e.target.value),
                });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />

            <div>
              <div className="flex justify-between">
                <div className="w-1/3 flex items-center">
                  <label htmlFor={'warehouse'} className="text-md">
                    Posisi Gudang
                  </label>
                </div>
                <div className="w-2/3">
                  {editToggle ? (
                    <>
                      {product?.warehouse_position && (
                        <select
                          value={product.warehouse_position}
                          ref={warehouseOptionRef}
                          disabled={loading || !editToggle}
                          id="warehouse-position"
                          name="warehouse-position"
                          onChange={(e) => {
                            setProduct({
                              ...product,
                              warehouse_position: e.target.value,
                            });
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="Gudang Jadi">Gudang Jadi</option>
                          <option value="Gudang Bahan">Gudang Bahan</option>
                        </select>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                      {product?.warehouse_position}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="w-1/3 flex items-center">
                <label htmlFor={'supplier'} className="text-md">
                  Supplier
                </label>
              </div>
              <div className="w-2/3">
                {editToggle ? (
                  <>
                    <select
                      value={product?.supplier?.id}
                      ref={supplierOptionRef}
                      disabled={loading || !editToggle}
                      id="supplier"
                      name="supplier"
                      onChange={(e) => {
                        const theSupplier = suppliers.find(
                          (supplier) => supplier.id === e.target.value
                        );
                        setProduct((prev) => {
                          if (prev === undefined) return;
                          return {
                            ...prev,
                            supplier: theSupplier,
                          };
                        });
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="" disabled selected>
                        Pilih Supplier
                      </option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.company_name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    {product?.supplier && product.supplier.company_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full justify-between mt-4">
              {editToggle && (
                <>
                  <div className="flex items-center">
                    <p
                      className="text-red-500 hover:text-red-600 cursor-pointer hover:underline text-sm"
                      onClick={() => setShowConfirmation(true)}
                    >
                      Hapus Produk
                    </p>
                  </div>
                  <button
                    disabled={loading}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
                  >
                    Simpan
                  </button>
                </>
              )}
            </div>
            {errorMessage && (
              <p className="absolute bottom-0 left-0 text-red-500 text-sm ">
                {errorMessage}
              </p>
            )}
          </form>
          <hr />
          <div className="flex flex-col gap-5">
            <div className="w-full">
              <p className="text-2xl font-medium">Riwayat Stock</p>
            </div>
            <div className="flex flex-col justify-center">
              <p>Periode tanggal:</p>
              <DateRangeComp
                showTop={true}
                {...{ startDate, endDate, setStartDate, setEndDate }}
              />
            </div>
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <td className=" py-3">Tanggal</td>
                <td className=" py-3">Jumlah Lama</td>
                <td className=" py-3">Jumlah Baru</td>
                <td className=" py-3">Selisih</td>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {stockHistory.filter((stock_history) => {
                  const date = new Date(stock_history.created_at ?? '');
                  return (
                    date >= new Date(startDate) && date <= new Date(endDate)
                  );
                }).length > 0 ? (
                  stockHistory.map((stock_history: StockHistory, index) => (
                    <tr key={index} className="border-b">
                      <SingleTableItem>
                        <span className="font-medium text-md">
                          {stock_history.created_at}
                          <br />
                          <span className="text-sm font-normal">
                            {stock_history.time}
                          </span>
                        </span>
                      </SingleTableItem>
                      <SingleTableItem>
                        {stock_history.old_count}
                      </SingleTableItem>
                      <SingleTableItem>{stock_history.count}</SingleTableItem>
                      <SingleTableItem>
                        <div className="flex items-center justify-between">
                          {stock_history.difference}
                          {Number(stock_history.difference) > 0 ? (
                            <GoTriangleUp
                              size={23}
                              className="text-green-500"
                            />
                          ) : (
                            <GoTriangleDown
                              size={23}
                              className="text-red-500"
                            />
                          )}
                        </div>
                      </SingleTableItem>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b">
                    <td colSpan={4} className="py-3 text-center">
                      Data tidak tersedia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showConfirmation && (
          <div
            className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 rounded-lg z-10 w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          >
            <div
              className="bg-white rounded-lg p-4 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg text-gray-900">
                Apakah anda yakin ingin menghapus produk ini?
              </p>
              <div className="w-full flex justify-end mt-3">
                <div className="flex relative w-[fit-content] gap-3">
                  {loading && (
                    <p className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-sm z-50 bg-opacity-50">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-xl" />
                    </p>
                  )}
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Tidak
                  </button>
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct();
                    }}
                  >
                    Ya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
