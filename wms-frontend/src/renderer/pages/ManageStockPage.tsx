import { db } from 'firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { Product } from 'renderer/interfaces/Product';
import { Purchase_History } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newPurchaseInitialState = {
  created_at: '',
  count: '0',
  purchase_price: '0',
  supplier: null,
  product: null,
  payment_status: 'unpaid',
} as Purchase_History;

export const ManageStockPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manageStockMode, setManageStockMode] = useState<
    'purchase' | 'from_other_warehouse' | ''
  >('');
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    'Gudang Jadi' | 'Gudang Bahan' | ''
  >('');
  const [newPurchase, setNewPurchase] = useState<Purchase_History>(
    newPurchaseInitialState
  );
  const [dispatchNote, setDispatchNote] = useState<string>('');

  useEffect(() => {
    setLoading(true);

    if (supplierList.length === 0 && manageStockMode === 'purchase') {
      const fetchSupplierList = async () => {
        const supplierQuery = query(collection(db, 'supplier'));
        const res = await getDocs(supplierQuery);
        const supplierList: Supplier[] = [];

        res.forEach((doc) => {
          supplierList.push({
            id: doc.id,
            ...doc.data(),
          } as Supplier);
        });

        setSupplierList(supplierList);
      };

      fetchSupplierList().catch(() => {
        setErrorMessage('An error occured while fetching supplier data');
      });
    }

    const fetchProductList = async (
      supplier_id: string,
      the_warehouse: string
    ) => {
      const productQuery = query(
        collection(db, 'product'),
        where('supplier', '==', doc(db, 'supplier', supplier_id)),
        where('warehouse_position', '==', the_warehouse)
      );
      const res = await getDocs(productQuery);
      const productList: Product[] = [];

      res.forEach((doc) => {
        productList.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      setProducts(productList);
    };

    if (selectedSupplier?.id && selectedWarehouse)
      fetchProductList(selectedSupplier.id, selectedWarehouse).catch(() => {
        setErrorMessage('An error occured while fetching product data');
      });

    setLoading(false);
  }, [manageStockMode, selectedSupplier, selectedWarehouse]);

  const handleSubmit = async () => {
    if (
      manageStockMode === '' ||
      selectedWarehouse === '' ||
      newPurchase.product === null ||
      (manageStockMode === 'purchase' && selectedSupplier === null) ||
      (manageStockMode === 'purchase' && newPurchase.purchase_price === '') ||
      (manageStockMode === 'from_other_warehouse' && dispatchNote === '')
    )
      return;

    setLoading(true);

    if (!newPurchase.product.id) return;
    const productRef = doc(db, 'product', newPurchase.product.id);

    if (manageStockMode === 'purchase')
      await runTransaction(db, (transaction) => {
        if (!selectedSupplier?.id) return Promise.reject();

        transaction.update(productRef, {
          count: newPurchase.count,
        });

        const newDocRef = doc(collection(db, 'purchase_history'));

        transaction.set(newDocRef, {
          product: newPurchase.product?.id,
          supplier: selectedSupplier.id,
          quantity: (
            Number(newPurchase.count) - Number(newPurchase.product?.count)
          ).toString(),
          price: newPurchase.purchase_price,
          date: newPurchase.created_at,
        });

        return Promise.resolve();
      });

    setLoading(false);
    navigate(-1);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Manage Stock
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('submit');
          handleSubmit().catch(() => {
            setErrorMessage('An error occured while submitting data');
          });
        }}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'change-of-stock-mode'} className="text-md">
              Change of stock mode
            </label>
          </div>
          <div className="w-2/3">
            <select
              defaultValue={''}
              disabled={loading}
              name="change-of-stock-mode"
              onChange={(e) => {
                if (
                  e.target.value === 'purchase' ||
                  e.target.value === 'from_other_warehouse'
                )
                  setManageStockMode(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Choose change of stock mode
              </option>
              <option value="purchase">Purchase</option>
              <option value="from_other_warehouse">
                From raw material warehouse
              </option>
            </select>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'warehouse-id'} className="text-md">
              Choose warehouse
            </label>
          </div>
          <div className="w-2/3">
            <select
              defaultValue={''}
              disabled={loading}
              name="warehouse-id"
              onChange={(e) => {
                if (
                  e.target.value === 'Gudang Jadi' ||
                  e.target.value === 'Gudang Bahan'
                )
                  setSelectedWarehouse(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Choose warehouse
              </option>
              {manageStockMode === 'purchase' ? (
                <>
                  <option value="Gudang Bahan">Gudang Bahan</option>
                  <option value="Gudang Jadi">Gudang Jadi</option>
                </>
              ) : manageStockMode === 'from_other_warehouse' ? (
                <>
                  <option value="Gudang Jadi">Gudang Jadi</option>
                </>
              ) : null}
            </select>
          </div>
        </div>
        {
          manageStockMode === 'purchase' ? (
            <div className="flex justify-between">
              <div className="w-1/3 flex items-center">
                <label htmlFor={'supplier-id'} className="text-md">
                  Choose supplier
                </label>
              </div>
              <div className="w-2/3">
                <select
                  defaultValue={''}
                  disabled={loading}
                  name="supplier-id"
                  onChange={(e) => {
                    setSelectedSupplier(
                      () =>
                        supplierList.find(
                          (supplier) => supplier.id === e.target.value
                        ) ?? null
                    );
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value={''} disabled>
                    Choose supplier
                  </option>
                  {supplierList.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : manageStockMode === 'from_other_warehouse' ? (
            <InputField
              loading={loading}
              label="Dispatch note"
              labelFor="dispatch-note"
              value={dispatchNote}
              onChange={(e) => setDispatchNote(() => e.target.value)}
            />
          ) : null // Default
        }
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'product-id'} className="text-md">
              Choose product
            </label>
          </div>
          <div className="w-2/3">
            <select
              defaultValue={''}
              disabled={loading}
              name="product-id"
              onChange={(e) => {
                setNewPurchase(() => ({
                  ...newPurchase,
                  product:
                    products.find((product) => product.id === e.target.value) ??
                    null,
                }));
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Choose product
              </option>
              {products
                .filter((product) => {
                  if (manageStockMode === 'purchase')
                    if (selectedSupplier)
                      return product.supplier?.id === selectedSupplier.id;
                })
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brand +
                      ' ' +
                      product.motor_type +
                      ' ' +
                      product.part +
                      ' ' +
                      product.available_color}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <InputField
          loading={loading}
          label="Quantity"
          labelFor="quantity"
          value={newPurchase.product?.count ?? '0'}
          onChange={(e) =>
            setNewPurchase(() => ({
              ...newPurchase,
              count: e.target.value,
            }))
          }
        />
        {manageStockMode === 'purchase' && (
          <InputField
            loading={loading}
            label="Purchase price"
            labelFor="purchase-price"
            value={newPurchase.purchase_price}
            onChange={(e) =>
              setNewPurchase(() => ({
                ...newPurchase,
                purchase_price: e.target.value,
              }))
            }
          />
        )}
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Purchase date
            </label>
          </div>
          <div className="w-2/3">
            <input
              disabled={loading}
              type="date"
              name="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => {
                setNewPurchase(() => ({
                  ...newPurchase,
                  created_at: e.target.value,
                }));
              }}
            />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Submit
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
    </PageLayout>
  );
};
