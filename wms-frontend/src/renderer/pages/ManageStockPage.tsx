import { format } from 'date-fns';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  AiFillRightCircle,
  AiOutlineLoading3Quarters,
  AiOutlineReload,
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

const newPurchaseInitialState = {
  created_at: '',
  purchase_price: 0,
  supplier: null,
  payment_status: 'unpaid',
  warehouse_position: '',
  products: [],
  time: '',
} as PurchaseHistory;

export const ManageStockPage = () => {
  const { user, warehousePosition } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manageStockMode, setManageStockMode] = useState<
    'purchase' | 'from_other_warehouse' | 'force-change' | ''
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
  const [acceptedProducts, setAcceptedProducts] = useState<
    (Product & { dispatch_note_id?: string; id?: string; status?: string })[]
  >([]); // For manage stock mode 'from_other_warehouse'
  const [dispatchNote, setDispatchNote] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const selectedSupplierRef = useRef<HTMLSelectElement>(null);
  const selectedWarehouseRef = useRef<HTMLSelectElement>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const [returnedProduct, setReturnedProduct] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const successNotify = () => toast.success('Stock berhasil diupdate');
  const failNotify = (e?: string) => toast.error(e ?? 'Stock gagal diupdate');
  // If the input Field is Empty
  const [isEmpty, setIsEmpty] = useState(false);

  // Check input Field
  useEffect(() => {
    if (manageStockMode === '') {
      setIsEmpty(true);
      return;
    } else if (manageStockMode === 'purchase') {
      if (
        selectedSupplier === null ||
        newPurchase.products.length === 0 ||
        (newPurchase.purchase_price === 0 && !returnedProduct) ||
        !selectedWarehouse ||
        dateInputRef.current?.value === ''
      ) {
        setIsEmpty(true);
        return;
      } else if (
        (newPurchase.products.length > 0 &&
          dateInputRef.current?.value !== '' &&
          !returnedProduct &&
          newPurchase.purchase_price > 0) ||
        returnedProduct
      )
        newPurchase.products.map((product) => {
          if (product.quantity === 0 || !product.quantity) {
            setIsEmpty(true);
            return;
          } else {
            setIsEmpty(false);
            return;
          }
        });
    } else if (manageStockMode === 'from_other_warehouse') {
      if (dispatchNote === '' || dateInputRef.current?.value === '') {
        setIsEmpty(true);
        return;
      } else if (
        dispatchNote &&
        dateInputRef.current?.value !== '' &&
        acceptedProducts.length != 0
      )
        acceptedProducts.map((product) => {
          if (product.count === null) {
            setIsEmpty(true);
            return;
          } else {
            setIsEmpty(false);
            return;
          }
        });
    } else if (
      selectedSupplier === null ||
      newPurchase.products.length === 0 ||
      !selectedWarehouse ||
      dateInputRef.current?.value === ''
    ) {
      setIsEmpty(true);
      return;
    } else if (
      newPurchase.products.length > 0 &&
      dateInputRef.current?.value !== ''
    )
      newPurchase.products.map((product) => {
        if (product.quantity === 0 || !product.quantity.toString()) {
          setIsEmpty(true);
          return;
        } else {
          setIsEmpty(false);
          return;
        }
      });
  }, [
    newPurchase,
    manageStockMode,
    selectedWarehouse,
    dispatchNote,
    acceptedProducts,
    returnedProduct,
  ]);

  useEffect(() => {
    setLoading(true);

    if (
      supplierList.length === 0 &&
      (manageStockMode === 'purchase' || manageStockMode === 'force-change')
    ) {
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

  useEffect(() => {
    if (!initialLoad) navigate('/');

    setInitialLoad(false);
  }, [warehousePosition]);

  const handleSubmit = async () => {
    if (
      manageStockMode === '' ||
      selectedWarehouse === '' ||
      ((manageStockMode === 'purchase' || manageStockMode === 'force-change') &&
        newPurchase.products.length === 0) ||
      ((manageStockMode === 'purchase' || manageStockMode === 'force-change') &&
        selectedSupplier === null) ||
      ((manageStockMode === 'purchase' || manageStockMode === 'force-change') &&
        newPurchase.purchase_price === 0 &&
        manageStockMode != 'force-change' &&
        !returnedProduct) ||
      (manageStockMode === 'from_other_warehouse' && dispatchNote === '') ||
      (manageStockMode === 'from_other_warehouse' &&
        acceptedProducts.length != products.length) ||
      newPurchase.created_at === ''
    ) {
      setErrorMessage('Please fill all the required fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);
    const currentDateandTime = new Date();
    if (!newPurchase.created_at) return Promise.reject('Date not found');
    let theTime = '';
    // If invoice date is the same as current date, take the current time
    if (newPurchase.created_at === format(currentDateandTime, 'yyyy-MM-dd'))
      theTime = format(currentDateandTime, 'HH:mm:ss');
    else theTime = '23:59:59';

    if (manageStockMode === 'purchase' || manageStockMode === 'force-change')
      await runTransaction(db, async (transaction) => {
        if (newPurchase.products.length === 0 || selectedSupplier === null)
          return Promise.reject();

        const productsPromises = newPurchase.products.map(async (product) => {
          if (!product.id) return Promise.reject();
          const productRef = doc(db, 'product', product.id);
          const updateStock = increment(product.quantity);

          transaction.update(productRef, {
            count: updateStock,
          });

          const productDetail = products.find(
            (product) => product.id === product.id
          );

          if (!productDetail) return Promise.reject('Product detail not found');

          const newStockHistoryDocRef = doc(collection(db, 'stock_history'));
          transaction.set(newStockHistoryDocRef, {
            product: product.id,
            product_name:
              productDetail.brand +
              ' ' +
              productDetail.motor_type +
              ' ' +
              productDetail.part +
              ' ' +
              productDetail.available_color,
            count: product.quantity + productDetail.count,
            old_count: productDetail.count,
            difference: product.quantity,
            warehouse_position: selectedWarehouse,
            type: 'purchase',
            created_at: newPurchase.created_at,
            time: theTime,
          });
        });

        // If not returned product, create new purchase history
        if (!returnedProduct && manageStockMode === 'purchase') {
          const newPurchaseHistoryDocRef = doc(
            collection(db, 'purchase_history')
          );

          transaction.set(newPurchaseHistoryDocRef, {
            supplier: selectedSupplier.id,
            created_at: newPurchase.created_at,
            time: theTime,
            purchase_price: newPurchase.purchase_price,
            payment_status: newPurchase.payment_status,
            warehouse_position: products[0].warehouse_position,
            products: newPurchase.products.map((product, index) => ({
              id: product.id,
              name:
                products[index].brand +
                ' ' +
                products[index].motor_type +
                ' ' +
                products[index].part +
                ' ' +
                products[index].available_color,
              quantity: product.quantity,
            })),
          });
        }
        if (returnedProduct && manageStockMode === 'purchase') {
          // Construct a query to find matching returned products
          newPurchase.products.map(async (newProduct) => {
            const returnedProductRef = doc(
              db,
              'returned_product',
              newProduct.id
            );

            const updateStock = increment(-1 * newProduct.quantity);

            transaction.update(returnedProductRef, {
              count: updateStock,
            });
          });
        }
        // Wait for all promises in the map to resolve
        Promise.all(productsPromises).catch(() => console.log('error'));

        return Promise.resolve();
      });
    // Add or update product count of arrived products on product list
    else
      await runTransaction(db, async (transaction) => {
        const promises = acceptedProducts.map(async (acceptedProduct) => {
          if (!acceptedProduct.id) return Promise.reject();

          delete acceptedProduct.status;
          delete acceptedProduct.dispatch_note_id;
          const theOldCount =
            products.find((product) => product.id === acceptedProduct.id)
              ?.count ?? 0;

          // Update product count
          const updateStock = increment(acceptedProduct.count);
          const productRef = doc(db, 'product', acceptedProduct.id);
          transaction.set(
            productRef,
            {
              brand: acceptedProduct.brand,
              motor_type: acceptedProduct.motor_type,
              part: acceptedProduct.part,
              available_color: acceptedProduct.available_color,
              sell_price: acceptedProduct.sell_price,
              count: updateStock,
              supplier: acceptedProduct.supplier,
              warehouse_position: 'Gudang Jadi',
            },
            {
              merge: true,
            }
          );

          // Create new stock history
          const newStockHistoryDocRef = doc(collection(db, 'stock_history'));
          transaction.set(
            newStockHistoryDocRef,
            {
              product: acceptedProduct.id,
              product_name:
                acceptedProduct.brand +
                ' ' +
                acceptedProduct.motor_type +
                ' ' +
                acceptedProduct.part +
                ' ' +
                acceptedProduct.available_color,
              old_count: theOldCount,
              difference: acceptedProduct.count,
              count: acceptedProduct.count + theOldCount,
              warehouse_position: selectedWarehouse,
              type: 'from_other_warehouse',
              created_at: newPurchase.created_at,
              time: theTime,
            },
            {
              merge: true,
            }
          );

          const actualProduct = products.find(
            (product) => product.id === acceptedProduct.id
          );
          if (!actualProduct) return Promise.reject('Product not found');
          if (acceptedProduct.count < actualProduct.count) {
            const brokenProductRef = doc(
              collection(db, 'broken_product'),
              acceptedProduct.id
            );

            const updateCount = increment(
              actualProduct.count - acceptedProduct.count
            );

            transaction.set(
              brokenProductRef,
              {
                ...acceptedProduct,
                count: updateCount,
                warehouse_position: 'Gudang Jadi',
              },
              {
                merge: true,
              }
            );
          }

          deleteDispatchNote();

          return Promise.resolve();
        });

        // Wait for all promises in the map to resolve
        await Promise.all(promises);

        return Promise.resolve();
      });

    setNewPurchase(newPurchaseInitialState);
    setSelectedSupplier(null);
    setSelectedWarehouse('');
    if (selectedSupplierRef.current) selectedSupplierRef.current.value = '';
    if (selectedWarehouseRef.current) selectedWarehouseRef.current.value = '';
    if (dateInputRef.current) dateInputRef.current.value = '';
    setReturnedProduct(false);
    setProducts([]);
    setAcceptedProducts([]);
    setDispatchNote('');
    setReturnedProduct(false);
    setModalOpen(false);
    setManageStockMode('');

    setLoading(false);
    successNotify();
  };

  const deleteDispatchNote = () => {
    if (!dispatchNote) return;

    const onDispatchProductRef = collection(db, 'on_dispatch');
    const onDispatchProductQuery = query(
      onDispatchProductRef,
      where('dispatch_note_id', '==', dispatchNote)
    );

    getDocs(onDispatchProductQuery)
      .then((res) => {
        res.forEach((doc) => {
          deleteDoc(doc.ref).catch((error) => {
            console.error('Error removing document: ', error);
          });
        });
      })
      .catch(() => console.log('error'));

    const dispatchNoteRef = doc(db, 'dispatch_note', dispatchNote);

    deleteDoc(dispatchNoteRef).catch((error) => {
      console.error('Error removing document: ', error);
    });
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
        Kelola Stock
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit().catch(() => {
            failNotify();
            setLoading(false);
          });
        }}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
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
              Mode Perubahan Stock
            </label>
          </div>
          <div className="w-2/3">
            <select
              value={manageStockMode}
              disabled={loading}
              name="change-of-stock-mode"
              onChange={(e) => {
                if (
                  e.target.value === 'purchase' ||
                  e.target.value === 'from_other_warehouse' ||
                  e.target.value === 'force-change'
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
                Pilih Mode
              </option>
              <option value="purchase">Pembelian</option>
              {warehousePosition !== 'Gudang Bahan' && (
                <option value="from_other_warehouse">Dari Gudang Bahan</option>
              )}
              {user?.role.toLowerCase() === 'owner' && (
                <option value="force-change">Ubah Paksa</option>
              )}
            </select>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'warehouse-id'} className="text-md">
              Pilih Gudang
            </label>
          </div>
          <div className="w-2/3">
            <select
              value={selectedWarehouse}
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
                Pilih Gudang
              </option>
              {manageStockMode === 'purchase' ||
              manageStockMode === 'force-change' ? (
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
          manageStockMode === 'purchase' ||
          manageStockMode === 'force-change' ? (
            <div className="flex justify-between">
              <div className="w-1/3 flex items-center">
                <label htmlFor={'supplier-id'} className="text-md">
                  Pilih Supplier
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
                    Pilih Supplier
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
                label="Surat Jalan"
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
                    {product.count.toString() +
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
                          Lolos quality check
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
                              Number(e.target.value) > Number(product.count)
                            ) {
                              setErrorMessage(
                                'Not enough stock in warehouse. Stock in warehouse: ' +
                                  product.count.toString()
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
                                      count: Number(e.target.value),
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
                                count: Number(e.target.value),
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
        {(manageStockMode === 'purchase' ||
          manageStockMode === 'force-change') && (
          <>
            <div className="flex justify-between">
              <div className="w-1/3 flex items-center">
                <label htmlFor={'product-id'} className="text-md">
                  Produk
                </label>
              </div>
              <div className="w-2/3">
                <button
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  type="button"
                  onClick={() => setModalOpen(() => !modalOpen)}
                >
                  Pilih Produk
                </button>
              </div>
            </div>
            {newPurchase.products.length > 0 && (
              <ul className="space-y-[1rem] font-regular">
                {newPurchase.products.map((product, index) => (
                  <li key={index} className="flex flex-row gap-2">
                    <p className="flex justify-start items-center w-4/5 gap-2">
                      <AiFillRightCircle /> {product.name}
                    </p>
                    <div className="w-1/5 flex justify-between items-center">
                      <input
                        disabled={loading}
                        placeholder="Jumlah"
                        type="number"
                        name="quantity"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        onChange={(e) => {
                          if (
                            Number(e.target.value) < 0 ||
                            e.target.value === ''
                          ) {
                            setErrorMessage('Quantity must be positive');
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
                                    count: Number(e.target.value),
                                  };
                                return acceptedProduct;
                              })
                            );
                            return;
                          }

                          // If the product is not in acceptedProduct, add it
                          setNewPurchase(() => ({
                            ...newPurchase,
                            products: newPurchase.products.map((product, i) => {
                              if (i === index)
                                return {
                                  ...product,
                                  quantity: Number(e.target.value),
                                };
                              return product;
                            }),
                          }));
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {manageStockMode !== 'force-change' && (
              <div className="flex justify-between py-2">
                <div className="w-1/3 flex items-center">
                  <label htmlFor={'returned-product'} className="text-md">
                    Produk Retur?
                  </label>
                </div>
                <div className="w-2/3 flex items-center">
                  <input
                    checked={returnedProduct}
                    disabled={loading}
                    type="checkbox"
                    name="returned-product"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    onChange={() => setReturnedProduct(() => !returnedProduct)}
                  />
                </div>
              </div>
            )}
            {!returnedProduct && manageStockMode !== 'force-change' && (
              <InputField
                loading={loading}
                label="Harga Beli"
                labelFor="purchase-price"
                value={newPurchase.purchase_price}
                onChange={(e) => {
                  if (
                    !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                    e.target.value !== ''
                  )
                    return;
                  setNewPurchase(() => ({
                    ...newPurchase,
                    purchase_price: Number(e.target.value),
                  }));
                }}
              />
            )}
          </>
        )}
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Tanggal Pembelian
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
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
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
        headerList={
          products.length > 0
            ? ['', 'Nama Produk', 'Posisi Gudang', 'Jumlah Tersedia']
            : []
        }
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <tr
              key={index}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                // If product is already in newPurchase, remove it
                if (newPurchase.products.some((p) => p.id === product.id)) {
                  setNewPurchase(() => ({
                    ...newPurchase,
                    products: newPurchase.products.filter(
                      (p) => p.id !== product.id
                    ),
                  }));
                  return;
                }

                // If product is not in newPurchase, add it
                if (product.id === undefined) return;
                const productId = product.id;
                setNewPurchase((prev) => ({
                  ...prev,
                  products: [
                    ...prev.products,
                    {
                      id: productId,
                      name:
                        product.brand +
                        ' ' +
                        product.motor_type +
                        ' ' +
                        product.part +
                        ' ' +
                        product.available_color,
                      quantity: 0,
                    },
                  ],
                }));
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={newPurchase.products.some(
                    (p) => p.id === product.id
                  )}
                  readOnly
                />
              </SingleTableItem>
              <SingleTableItem key={index}>
                {product.brand +
                  ' ' +
                  product.motor_type +
                  ' ' +
                  product.part +
                  ' ' +
                  product.available_color}
              </SingleTableItem>
              <SingleTableItem>{product.warehouse_position}</SingleTableItem>
              <SingleTableItem>{product.count}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">Produkt tidak ditemukan</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </PageLayout>
  );
};
