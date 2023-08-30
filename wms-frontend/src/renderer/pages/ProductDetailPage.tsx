import { db } from 'firebase';
import {
  collection,
  collectionGroup,
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
import { useNavigate, useParams } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (param.id === undefined) return;
        const productRef = doc(db, 'product', param.id);
        const theProduct = await getDoc(productRef);
        const data = theProduct.data() as Product;
        data.id = theProduct.id;
        setProduct(data);

        // Fetch supplier
        const supplierQeury = query(collection(db, 'supplier'));
        const supplierQuerySnapshot = await getDocs(supplierQeury);

        const supplierData: Supplier[] = [];
        supplierQuerySnapshot.forEach((theSupplier) => {
          const data = theSupplier.data() as Supplier;
          data.id = theSupplier.id;
          supplierData.push(data);
        });
        setSupplier(supplierData);
        // Fetch stock history
        // Fetch stock history
        const stockHistoryQuery = query(
          collectionGroup(db, 'stock_history'),
          where('product', '==', productRef)
        );
        const stockHistoryQuerySnapshot = await getDocs(stockHistoryQuery);

        const stockHistoryData: StockHistory[] = [];
        stockHistoryQuerySnapshot.forEach((theStockHistory) => {
          const stockHistory = theStockHistory.data() as StockHistory;
          if (stockHistory.updated_at === undefined) return;
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
      Object.values(product).some(
        (value) => value === '' || value === undefined
      )
    ) {
      setErrorMessage('Mohon isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (
      Number.isNaN(Number(product.sell_price)) ||
      Number.isNaN(Number(product.buy_price)) ||
      Number.isNaN(Number(product.count)) ||
      Number(product.sell_price) <= 0 ||
      Number(product.buy_price) <= 0 ||
      Number(product.count) <= 0
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
      buy_price: product.buy_price,
      sell_price: product.sell_price,
      warehouse_position: product.warehouse_position,
      supplier: product.supplier,
    };

    setLoading(true);

    updateDoc(productRef, updatedProduct).catch((error) => {
      console.error('Error updating document: ', error);
    });

    setLoading(false);
    setEditToggle(false);
  }

  return (
    <PageLayout>
      <div className="flex justify-between">
        <button
          type="button"
          className="px-4 py-2 font-medium text-white bg-gray-600  focus:ring-4 focus:ring-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <h1 className="mb-[4rem] text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Product Detail
        </h1>
        <button
          type="button"
          className="px-4 py-2 font-medium text-white bg-gray-600  focus:ring-4 focus:ring-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
          onClick={() => setEditToggle(!editToggle)}
        >
          {editToggle ? (
            <>
              Cancel
              <GiCancel />
            </>
          ) : (
            <>
              Edit Product
              <AiFillEdit />
            </>
          )}
        </button>
      </div>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <form
            onSubmit={handleSubmit}
            className={`w-full flex flex-col gap-3 relative ${
              loading ? 'p-2' : ''
            } transform transition-all duration-300`}
          >
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <InputField
              loading={loading || !editToggle}
              labelFor="brand"
              label="Brand"
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
              label="Motorcyle Type"
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
            <InputField
              loading={loading || !editToggle}
              labelFor="available_color"
              label="Available Color"
              value={product?.available_color ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, available_color: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="count"
              label="Product Count"
              value={product?.count ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, count: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="purchase_price"
              label="Purchase Price"
              value={product?.buy_price ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, buy_price: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="sell_price"
              label="Sell Price"
              value={product?.sell_price ?? ''}
              onChange={(e) => {
                if (product === undefined) return;
                setProduct({ ...product, sell_price: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <div>
              <div className="flex justify-between">
                <div className="w-1/3">
                  <label htmlFor={'warehouse'} className="text-md">
                    Warehouse Position
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
            <div>
              <div className="flex justify-between">
                <div className="w-1/3">
                  <label htmlFor={'supplier'} className="text-md">
                    Supplier
                  </label>
                </div>
                <div className="w-2/3">
                  {editToggle ? (
                    <>
                      {product?.supplier && product.supplier.id && (
                        <select
                          value={product.supplier.id}
                          ref={supplierOptionRef}
                          disabled={loading || !editToggle}
                          id="supplier"
                          name="supplier"
                          onChange={(e) => {
                            if (product.supplier === undefined) return;
                            const theSupplier = suppliers.find(
                              (supplier) => supplier.id === e.target.value
                            );
                            if (!theSupplier) return;
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
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.company_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                      {product?.supplier && product.supplier.company_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-row-reverse gap-2 w-full justify-start">
              {editToggle && (
                <button
                  disabled={loading}
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Submit
                </button>
              )}
            </div>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <TableHeader>
                <td className="px-4 py-3">Date</td>
                <td className="px-4 py-3">Old count</td>
                <td className="px-4 py-3">New count</td>
                <td className="px-4 py-3">Difference</td>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {stockHistory.map((stock_history: StockHistory, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <SingleTableItem>
                      {stock_history.updated_at?.toDate().toLocaleDateString()}
                    </SingleTableItem>
                    <SingleTableItem>{stock_history.old_count}</SingleTableItem>
                    <SingleTableItem>{stock_history.new_count}</SingleTableItem>
                    <SingleTableItem>
                      <div className="flex items-center justify-between">
                        {stock_history.difference}
                        {Number(stock_history.difference) > 0 ? (
                          <GoTriangleUp size={23} className="text-green-500" />
                        ) : (
                          <GoTriangleDown size={23} className="text-red-500" />
                        )}
                      </div>
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </div>
    </PageLayout>
  );
}
