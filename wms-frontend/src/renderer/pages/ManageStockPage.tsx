import { db } from 'firebase';
import {
  Transaction,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Product } from 'renderer/interfaces/Product';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newPurchaseInitialState = {
  created_at: '',
  count: '0',
  purchase_price: '0',
  supplier: null,
  product: null,
  payment_status: 'unpaid',
} as PurchaseHistory;

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
  const [newPurchase, setNewPurchase] = useState<PurchaseHistory>(
    newPurchaseInitialState
  );
  const [acceptedProducts, setAcceptedProducts] = useState<Product[]>([]); // For manage stock mode 'from_other_warehouse'
  const [dispatchNote, setDispatchNote] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const selectedSupplierRef = useRef<HTMLSelectElement>(null);
  const selectedWarehouseRef = useRef<HTMLSelectElement>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

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
        where('supplier', '==', supplier_id),
        where('warehouse_position', '==', the_warehouse)
      );
      const res = await getDocs(productQuery);
      const productList: Product[] = [];

      res.forEach((doc) => {
        productList.push({
          id: doc.id,
          ...doc.data(),
          supplier: supplierList.find(
            (supplier) => supplier.id === doc.data().supplier
          ),
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
    console.log(newPurchase);
    if (
      manageStockMode === '' ||
      selectedWarehouse === '' ||
      (manageStockMode === 'purchase' && newPurchase.product === null) ||
      (manageStockMode === 'purchase' && selectedSupplier === null) ||
      (manageStockMode === 'purchase' && newPurchase.purchase_price === '') ||
      (manageStockMode === 'from_other_warehouse' && dispatchNote === '') ||
      (manageStockMode === 'from_other_warehouse' &&
        acceptedProducts.length != products.length) ||
      (manageStockMode === 'from_other_warehouse' &&
        acceptedProducts.some(
          (acceptedProduct) => acceptedProduct.count === ''
        ))
    ) {
      setErrorMessage('Please fill all the required fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);

    if (manageStockMode === 'purchase')
      await runTransaction(db, (transaction) => {
        if (!newPurchase.product?.id) return Promise.reject();

        const productRef = doc(db, 'product', newPurchase.product.id);
        if (!selectedSupplier?.id) return Promise.reject();

        transaction.update(productRef, {
          count: newPurchase.count,
        });

        const newPurchaseHistoryDocRef = doc(
          collection(db, 'purchase_history')
        );

        transaction.set(newPurchaseHistoryDocRef, {
          ...newPurchase,
          count: (
            Number(newPurchase.count) - Number(newPurchase.product.count)
          ).toString(),
          product: newPurchase.product.id,
          supplier: selectedSupplier.id,
        });

        const newStockHistoryDocRef = doc(collection(db, 'stock_history'));

        transaction.set(newStockHistoryDocRef, {
          product: newPurchase.product.id,
          product_name:
            newPurchase.product.brand +
            ' ' +
            newPurchase.product.motor_type +
            ' ' +
            newPurchase.product.part +
            ' ' +
            newPurchase.product.available_color,
          count: newPurchase.count,
          old_count: newPurchase.product.count,
          difference: (
            Number(newPurchase.count) - Number(newPurchase.product.count)
          ).toString(),
          warehouse_position: selectedWarehouse,
          type: 'purchase',
          created_at: newPurchase.created_at,
          purchase_history: newPurchaseHistoryDocRef.id,
        });

        return Promise.resolve();
      });
    // Add or update product count of arrived products on product list
    else
      await runTransaction(db, async (transaction) => {
        const promises = acceptedProducts.map(async (acceptedProduct) => {
          if (!acceptedProduct.id) return Promise.reject();
          const productQuery = query(
            collection(db, 'product'),
            where('warehouse_position', '==', 'Gudang Jadi'),
            where('available_color', '==', acceptedProduct.available_color),
            where('brand', '==', acceptedProduct.brand),
            where('motor_type', '==', acceptedProduct.motor_type),
            where('part', '==', acceptedProduct.part),
            where('supplier', '==', acceptedProduct.supplier)
          );

          const productQuerySnapshot = await getDocs(productQuery);

          if (productQuerySnapshot.empty) {
            // Create new product
            const newProductDocRef = doc(collection(db, 'product'));

            transaction.set(newProductDocRef, {
              ...acceptedProduct,
              warehouse_position: 'Gudang Jadi',
            });

            const newStockHistoryDocRef = doc(collection(db, 'stock_history'));

            transaction.set(newStockHistoryDocRef, {
              product: newProductDocRef.id,
              product_name:
                acceptedProduct.brand +
                ' ' +
                acceptedProduct.motor_type +
                ' ' +
                acceptedProduct.part +
                ' ' +
                acceptedProduct.available_color,
              count: acceptedProduct.count,
              old_count: '0',
              difference: acceptedProduct.count,
              warehouse_position: selectedWarehouse,
              type: 'from_other_warehouse',
              created_at: newPurchase.created_at,
            });

            checkBrokenProduct(
              acceptedProduct,
              products.find((product) => product.id === acceptedProduct.id)!,
              transaction
            );
            deleteDispatchNote();

            return Promise.resolve();
          }

          const product = productQuerySnapshot.docs[0];

          transaction.update(product.ref, {
            count:
              parseInt(acceptedProduct.count) + parseInt(product.data().count),
          });

          const newStockHistoryDocRef = doc(collection(db, 'stock_history'));

          transaction.set(newStockHistoryDocRef, {
            product: acceptedProduct.id,
            product_name:
              acceptedProduct.brand +
              ' ' +
              acceptedProduct.motor_type +
              ' ' +
              acceptedProduct.part +
              ' ' +
              acceptedProduct.available_color,
            count:
              parseInt(acceptedProduct.count) + parseInt(product.data().count),
            old_count: product.data().count,
            difference: acceptedProduct.count,
            warehouse_position: selectedWarehouse,
            type: 'from_other_warehouse',
            created_at: newPurchase.created_at,
            dispatch_note: dispatchNote,
          });

          checkBrokenProduct(
            acceptedProduct,
            products.find((product) => product.id === acceptedProduct.id)!,
            transaction
          );
          deleteDispatchNote();

          return Promise.resolve();
        });

        // Wait for all promises in the map to resolve
        await Promise.all(promises);

        return Promise.resolve();
      });

    setNewPurchase(newPurchaseInitialState);

    setLoading(false);
    navigate(-1);
  };

  const deleteDispatchNote = async () => {
    if (!dispatchNote) return;

    const docRef = doc(db, 'dispatch_note', dispatchNote);

    deleteDoc(docRef)
      .then(() => {
        console.log('Document successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  };

  const checkBrokenProduct = async (
    acceptedProduct: Product,
    product: Product,
    transaction: Transaction
  ) => {
    // If (arrivedProduct.count < product.data().count)
    // Add the difference to broken product database
    if (acceptedProduct.count < product.count) {
      // Check if the product is already in broken product database
      const brokenProductQuery = query(
        collection(db, 'broken_product'),
        where('warehouse_position', '==', 'Gudang Jadi'),
        where('available_color', '==', acceptedProduct.available_color),
        where('brand', '==', acceptedProduct.brand),
        where('motor_type', '==', acceptedProduct.motor_type),
        where('part', '==', acceptedProduct.part),
        where('supplier', '==', acceptedProduct.supplier)
      );

      const brokenProductQuerySnapshot = await getDocs(brokenProductQuery);

      if (brokenProductQuerySnapshot.empty) {
        // Create new broken product
        const newBrokenProductDocRef = doc(collection(db, 'broken_product'));

        transaction.set(newBrokenProductDocRef, {
          ...acceptedProduct,
          count: parseInt(product.count) - parseInt(acceptedProduct.count),
          warehouse_position: 'Gudang Jadi',
        });
      } else {
        // Update broken product count
        const brokenProduct = brokenProductQuerySnapshot.docs[0];

        transaction.update(brokenProduct.ref, {
          count:
            parseInt(product.count) -
            parseInt(acceptedProduct.count) +
            parseInt(brokenProduct.data().count),
        });
      }
    }
  };

  const handleFetchDispatchNote = async () => {
    if (dispatchNote === '') return;

    setLoading(true);

    const dispatchedProductQuery = query(
      collection(db, 'on_dispatch'),
      where('dispatch_note_id', '==', dispatchNote)
    );

    const dispatchedProductQuerySnapshot = await getDocs(
      dispatchedProductQuery
    );

    const dispatchedProductList: Product[] = [];

    dispatchedProductQuerySnapshot.forEach((doc) => {
      dispatchedProductList.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    setProducts(dispatchedProductList);
    setLoading(false);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl pt-4">
        Manage Stock
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
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

                setProducts([]);
                setAcceptedProducts([]);
                setNewPurchase(newPurchaseInitialState);
                setSelectedSupplier(null);
                setSelectedWarehouse('');
                if (selectedSupplierRef.current)
                  selectedSupplierRef.current.value = '';
                if (selectedWarehouseRef.current)
                  selectedWarehouseRef.current.value = '';
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
              value={selectedWarehouse != '' ? selectedWarehouse : ''}
              disabled={loading}
              name="warehouse-id"
              onChange={(e) => {
                if (
                  e.target.value === 'Gudang Jadi' ||
                  e.target.value === 'Gudang Bahan'
                )
                  setSelectedWarehouse(e.target.value);

                setProducts([]);
                setAcceptedProducts([]);
                setNewPurchase(newPurchaseInitialState);
                setSelectedSupplier(null);
                if (selectedSupplierRef.current)
                  selectedSupplierRef.current.value = '';
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Choose warehouse
              </option>
              {manageStockMode === 'purchase' ? (
                <>
                  <option key={'gudang_bahan'} value="Gudang Bahan">
                    Gudang Bahan
                  </option>
                  <option key={'gudang_jadi'} value="Gudang Jadi">
                    Gudang Jadi
                  </option>
                </>
              ) : manageStockMode === 'from_other_warehouse' ? (
                <>
                  <option key={'gudang_jadi'} value="Gudang Jadi">
                    Gudang Jadi
                  </option>
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
                  value={selectedSupplier?.id ?? ''}
                  disabled={loading}
                  name="supplier-id"
                  onChange={(e) => {
                    setSelectedSupplier(
                      () =>
                        supplierList.find(
                          (supplier) => supplier.id === e.target.value
                        ) ?? null
                    );
                    setProducts([]);
                    setNewPurchase(newPurchaseInitialState);
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
            <div className="flex items-center relative">
              <InputField
                loading={loading}
                label="Dispatch note"
                labelFor="dispatch-note"
                value={dispatchNote}
                onChange={(e) => {
                  setDispatchNote(() => e.target.value);
                }}
                additionalStyle="pr-10"
              />
              <button
                disabled={loading}
                type="button"
                className="absolute right-2 text-white bg-gray-600 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-[0.25rem]"
                onClick={() => {
                  handleFetchDispatchNote().catch(() => console.log('error'));
                }}
              >
                <AiOutlineReload />
              </button>
            </div>
          ) : null // Default
        }
        {manageStockMode === 'from_other_warehouse' && (
          <ul className="my-3 space-y-3 font-regular">
            {products.length > 0 &&
              products.map((product, index) => (
                <li key={index}>
                  <p className="flex justify-start">
                    {product.count +
                      'x ' +
                      product.brand +
                      ' ' +
                      product.motor_type +
                      ' ' +
                      product.part +
                      ' ' +
                      product.available_color}
                  </p>
                  <div className="flex flex-row gap-2 justify-between items-center">
                    <div className="w-full flex justify-between items-center">
                      <div className="w-4/5">
                        <label htmlFor={'quantity'} className="text-md">
                          Passed quality check
                        </label>
                      </div>
                      <div className="w-1/5">
                        <input
                          disabled={loading}
                          type="number"
                          name="quantity"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          onChange={(e) => {
                            if (
                              product &&
                              Number(e.target.value) > Number(product.count)
                            ) {
                              setErrorMessage(
                                'Not enough stock in warehouse. Stock in warehouse: ' +
                                  product.count
                              );
                              // Set e target value with the value without the last character
                              e.target.value = e.target.value.slice(0, -1);
                              setTimeout(() => {
                                setErrorMessage(null);
                              }, 3000);
                              return;
                            }
                            // If the product is already in acceptedProduct, update the count
                            if (
                              acceptedProducts.find(
                                (acceptedProduct) =>
                                  acceptedProduct.id === product.id
                              )
                            ) {
                              setAcceptedProducts(() =>
                                acceptedProducts.map((acceptedProduct) => {
                                  if (acceptedProduct.id === product.id)
                                    return {
                                      ...acceptedProduct,
                                      count: e.target.value,
                                    };
                                  return acceptedProduct;
                                })
                              );
                              return;
                            }
                            // If the product is not in acceptedProduct, add it
                            setAcceptedProducts(() => [
                              ...acceptedProducts,
                              {
                                ...product,
                                count: e.target.value,
                              },
                            ]);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
        {manageStockMode === 'purchase' && (
          <div>
            <div className="flex justify-between">
              <div className="w-1/3 flex items-center">
                <label htmlFor={'product-id'} className="text-md">
                  Choose product
                </label>
              </div>
              <div className="w-2/3">
                <button
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  type="button"
                  onClick={() => setModalOpen(() => !modalOpen)}
                >
                  {newPurchase.product ? (
                    <p className="flex justify-start">
                      {newPurchase.product.brand +
                        ' ' +
                        newPurchase.product.motor_type +
                        ' ' +
                        newPurchase.product.part +
                        ' ' +
                        newPurchase.product.available_color}
                    </p>
                  ) : (
                    'Choose product(s)'
                  )}
                </button>
              </div>
            </div>
            <InputField
              loading={loading}
              label="Quantity"
              labelFor="quantity"
              value={newPurchase.count}
              onChange={(e) => {
                if (isNaN(Number(e.target.value))) return;

                setNewPurchase(() => ({
                  ...newPurchase,
                  count: e.target.value,
                }));
              }}
            />
            <InputField
              loading={loading}
              label="Purchase price"
              labelFor="purchase-price"
              value={newPurchase.purchase_price}
              onChange={(e) => {
                if (!/^[0-9]+$/.test(e.target.value) && e.target.value !== '')
                  return;
                setNewPurchase(() => ({
                  ...newPurchase,
                  purchase_price: e.target.value,
                }));
              }}
            />
          </div>
        )}
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Purchase date
            </label>
          </div>
          <div className="w-2/3">
            <input
              ref={dateInputRef}
              disabled={loading}
              type="date"
              name="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => {
                console.log(e.target.value);
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
      <TableModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title={'Choose Product'}
        headerList={products.length > 0 ? ['Product name', 'Count'] : []}
      >
        {products.length > 0 &&
          products.map((product, index) => (
            <tr
              key={index}
              className="border-b hover:shadow-md cursor-pointer"
              onClick={() => {
                setNewPurchase(() => ({
                  ...newPurchase,
                  product: product,
                }));
                setModalOpen(() => false);
              }}
            >
              <SingleTableItem key={index}>
                {product.brand +
                  ' ' +
                  product.motor_type +
                  ' ' +
                  product.part +
                  ' ' +
                  product.available_color}
              </SingleTableItem>
              <SingleTableItem>{product.count}</SingleTableItem>
            </tr>
          ))}
        {products.length <= 0 && (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
};
