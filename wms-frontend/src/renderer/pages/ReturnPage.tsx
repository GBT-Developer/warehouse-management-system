import { format } from 'date-fns';
import {
  FieldValue,
  and,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  or,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { db } from 'renderer/firebase';
import { Customer } from 'renderer/interfaces/Customer';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

const invoiceInitialState: Invoice = {
  customer_id: '',
  customer_name: '',
  total_price: 0,
  payment_method: '',
  items: [],
  date: '',
  time: '',
  warehouse_position: '',
};

export default function ReturnPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'return' | 'exchange' | 'void' | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [newTransaction, setNewTransaction] =
    useState<Invoice>(invoiceInitialState);

  const [invoice, setInvoice] = useState<Invoice>(invoiceInitialState);
  const [selectedItems, setSelectedItems] = useState<
    (Product & {
      is_returned?: boolean;
    })[]
  >([]);
  const [selectedNewItems, setSelectedNewItems] = useState<
    (Product & {
      is_returned?: boolean;
    })[]
  >([]);
  const successNotify = () => toast.success('Barang berhasil ditukar');
  const failNotify = (e?: string) => toast.error(e ?? 'Barang gagal ditukar');
  const getSpecialPriceForProduct = (productId: string) => {
    const specialPrice = selectedCustomer?.SpecialPrice.find(
      (p) => p.product_id === productId
    );
    return specialPrice ? specialPrice.price : null;
  };
  const [isEmpty, setIsEmpty] = useState(false);

  // Check input Field
  useEffect(() => {
    if (mode === 'return' || mode === 'exchange')
      if (invoiceNumber === '' || selectedItems.length === 0) {
        setIsEmpty(true);
        return;
      } else {
        setIsEmpty(false);
        return;
      }
    else if (mode === 'void')
      if (
        invoiceNumber === '' ||
        selectedNewItems.length === 0 ||
        newTransaction.payment_method === ''
      ) {
        setIsEmpty(true);
        return;
      } else if (
        invoiceNumber != '' &&
        selectedNewItems.length > 0 &&
        newTransaction.payment_method != ''
      ) {
        setIsEmpty(false);
        return;
      }
  }, [invoiceNumber, selectedItems, mode, newTransaction, selectedNewItems]);

  useEffect(() => {
    if (!initialLoad) navigate('/');

    setInitialLoad(false);
  }, [warehousePosition]);

  const handleSubmit = async () => {
    // Check whether all inputs are filled
    if (mode === '') return Promise.reject('Pilih mode penukaran');
    if (!invoiceNumber) return Promise.reject('Masukkan nomor invoice');
    if (
      (mode !== 'void' && selectedItems.length === 0) ||
      (mode === 'void' && selectedNewItems.length === 0)
    )
      return Promise.reject('Pilih minimal 1 produk');
    if (mode === 'void' && !newTransaction.payment_method)
      return Promise.reject('Pilih metode transaksi');

    setLoading(true);

    // If mode is exchange, check if there is enough stock
    if (mode === 'exchange')
      await runTransaction(db, async (transaction) => {
        try {
          const promises = selectedItems.map(async (item) => {
            // Get product data
            if (!item.id) return Promise.reject('Product id is undefined');
            const productRef = doc(db, 'product', item.id);
            const productSnap = await transaction.get(productRef);
            const product = productSnap.data() as Product;

            // Check if there is enough stock
            if (product.count < item.count)
              return Promise.reject('Stock di gudang tidak cukup');

            // Update product count
            const difference = product.count - item.count;
            transaction.update(
              doc(db, 'product', item.id),
              'count',
              difference
            );

            const incrementBorkenProductStock = increment(item.count);
            // Put the returned product to broken product database
            transaction.set(
              doc(db, 'broken_product', item.id),
              {
                ...product,
                count: incrementBorkenProductStock,
              },
              { merge: true }
            );

            return Promise.resolve('Success');
          });
          setLoading(false);
          await Promise.all(promises);
          return Promise.resolve('Success'); // If all promises are resolved, return 'Success
        } catch (err) {
          return Promise.reject(err);
        }
      });
    else if (mode === 'return') {
      // Decrease the count of the item in the invoice
      // If count is 0, delete the item from the invoice
      selectedItems.forEach((selectedItem) => {
        const itemInInvoice = invoice.items?.find(
          (item) => item.id === selectedItem.id
        );
        if (itemInInvoice?.count === selectedItem.count)
          // Delete the item
          invoice.items?.splice(
            invoice.items.findIndex((item) => item.id === selectedItem.id),
            1
          );
        // Decrease the count
        else if (itemInInvoice?.count)
          itemInInvoice.count -= selectedItem.count;
      });

      // Reduce the total price
      if (invoice.total_price)
        invoice.total_price =
          invoice.total_price -
          selectedItems.reduce(
            (acc, cur) => acc + cur.sell_price * cur.count,
            0
          );

      // Merge the invoice items with the selected items
      // But if the item is already in the invoice, just increase the count
      selectedItems.forEach((selectedItem) => {
        selectedItem.is_returned = true;
        const itemIndex = invoice.items?.findIndex(
          (item) => item.id === selectedItem.id
        );
        if (itemIndex === -1 || itemIndex === undefined)
          invoice.items?.push(selectedItem);
        else if (invoice.items)
          invoice.items[itemIndex].count =
            invoice.items[itemIndex].count - selectedItem.count;
      });

      // Update the invoice
      await runTransaction(db, (transaction) => {
        transaction.update(doc(db, 'invoice', invoiceNumber), {
          items: invoice.items,
          total_price: invoice.total_price,
        });

        // Put the returned product to broken product database
        const promises = selectedItems.map(async (item) => {
          const brokenProductRef = doc(
            collection(db, 'broken_product'),
            item.id
          );

          const updateCount = increment(item.count);
          delete item.id;
          transaction.set(
            brokenProductRef,
            {
              ...item,
              count: updateCount,
            },
            {
              merge: true,
            }
          );

          return Promise.resolve();
        });
        // Reduce the sales stats
        reduceSalesStats(invoice, false).catch((err) => console.log(err));
        return Promise.all(promises);
      });
    } else {
      await runTransaction(db, (transaction) => {
        // Delete the invoice
        transaction.delete(doc(db, 'invoice', invoiceNumber));
        // Reduce the sales stats
        reduceSalesStats(invoice, false).catch((err) => console.log(err));

        // Put the old invoice to void list
        transaction.set(doc(db, 'void_invoice', invoiceNumber), {
          ...invoice,
          items: checkedItems.map((checkedItem, index) => {
            if (invoice.items)
              return {
                ...invoice.items[index],
                is_returned: true,
              };
          }),
        });

        // Put the new invoice to invoice list
        const total_price = selectedNewItems.reduce(
          (acc, item) => acc + item.sell_price * item.count,
          0
        );
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        const currentTime = format(new Date(), 'HH:mm:ss');

        transaction.set(doc(collection(db, 'invoice')), {
          customer_id: selectedCustomer?.id ?? '',
          customer_name: selectedCustomer?.name ?? invoice.customer_name ?? '',
          total_price: total_price,
          warehouse_position: selectedNewItems[0].warehouse_position,
          items: selectedNewItems.map((selectedNewItem) => {
            return {
              ...selectedNewItem,
              is_returned: false,
            };
          }),
          date: currentDate,
          time: currentTime,
          payment_method: newTransaction.payment_method,
        });
        // Reduce the sales stats
        reduceSalesStats(
          {
            customer_id: selectedCustomer?.id ?? '',
            customer_name:
              selectedCustomer?.name ?? invoice.customer_name ?? '',
            total_price: total_price,
            items: selectedNewItems.map((selectedNewItem) => {
              return {
                ...selectedNewItem,
                is_returned: false,
              };
            }),
            date: new Date().toISOString().slice(0, 10),
            payment_method: newTransaction.payment_method,
            time: currentTime,
          },
          true
        ).catch((err) => console.log(err));

        return Promise.resolve();
      });
    }
    console.log('kesini');
    // Clear the form
    setInvoiceNumber('');
    setCheckedItems([]);
    setInvoice(invoiceInitialState);
    setSelectedItems([]);
    setMode('');
    setSelectedProducts([]);
    setSelectedNewItems([]);
    setNewTransaction(invoiceInitialState);
    setLoading(false);
    successNotify();
  };

  const handleFetchCustomer = async (theInvoice: Invoice) => {
    if (!theInvoice.customer_id) return;
    const customerRef = doc(db, 'customer', theInvoice.customer_id);
    const customerSnap = await getDoc(customerRef);
    const customerData = customerSnap.data() as Customer;
    customerData.id = customerSnap.id;
    setSelectedCustomer(customerData);
  };

  const handleFetchInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invoiceNumber) return;

    try {
      setLoading(true);
      const invoiceQuery = query(
        collection(db, 'invoice'),
        where(documentId(), '==', invoiceNumber),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi'])
      );
      const invoiceSnap = await getDocs(invoiceQuery);

      if (invoiceSnap.empty) {
        setErrorMessage('Invoice tidak ditemukan');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        setLoading(false);
        return;
      }

      const invoiceData = invoiceSnap.docs[0].data() as Invoice;
      setInvoice(() => invoiceData);

      setCheckedItems(new Array(invoiceData.items?.length).fill(false));
      setLoading(false);

      return Promise.resolve(invoiceData);
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat mengambil invoice');
      setLoading(false);
    }
  };

  const handleSearch = async (search: string) => {
    const productsQuery = query(
      collection(db, 'product'),
      or(
        // Query as-is:
        and(
          where('brand', '>=', search),
          where('brand', '<=', search + '\uf8ff')
        ),
        // Capitalize first letter:
        and(
          where(
            'brand',
            '>=',
            search.charAt(0).toUpperCase() + search.slice(1)
          ),
          where(
            'brand',
            '<=',
            search.charAt(0).toUpperCase() + search.slice(1) + '\uf8ff'
          )
        ),
        // Lowercase:
        and(
          where('brand', '>=', search.toLowerCase()),
          where('brand', '<=', search.toLowerCase() + '\uf8ff')
        )
      )
    );
    const querySnapshot = await getDocs(productsQuery);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Product;
      data.id = doc.id;
      products.push(data);
    });
    setProducts(products);
  };

  const reduceSalesStats = async (invoice: Invoice, positive: boolean) => {
    // Reduce the sales stats
    await runTransaction(db, (transaction) => {
      if (!invoice.total_price) return Promise.resolve();

      const currentMonth = format(new Date(), 'MM');

      // Take the month of the invoice
      if (invoice.date) {
        const invoiceMonth = format(new Date(invoice.date), 'MM');
        if (invoiceMonth !== currentMonth) return Promise.resolve();
      }

      const incrementTransaction = increment(positive ? 1 : -1);
      const incrementTotalSales = increment(
        positive ? invoice.total_price : -invoice.total_price
      );
      const statsDocRef = doc(db, 'invoice', '--stats--');
      const dailySales = new Map<string, FieldValue>();
      const datePriceMap = new Map<string, number>();

      invoice.items?.forEach((item) => {
        if (!invoice.date) return;
        const date = format(new Date(invoice.date), 'dd');
        const total_price = item.sell_price * item.count;
        const currentTotal = datePriceMap.get(date);
        if (currentTotal) {
          const currentIncrement = increment(
            positive ? total_price + currentTotal : -total_price + currentTotal
          );
          datePriceMap.set(
            date,
            positive ? total_price + currentTotal : currentTotal - total_price
          );
          dailySales.set(date, currentIncrement);
        } else {
          const currentIncrement = increment(
            positive ? total_price : -total_price
          );
          datePriceMap.set(date, total_price);
          dailySales.set(date, currentIncrement);
        }
      });

      transaction.set(
        statsDocRef,
        {
          transaction_count: incrementTransaction,
          total_sales: incrementTotalSales,
          daily_sales: Object.fromEntries(dailySales),
        },
        { merge: true }
      );

      return Promise.resolve();
    });
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl pt-4">
        Pengembalian Barang
      </h1>
      <form
        onSubmit={(e) => {
          handleFetchInvoice(e)
            .then((invoice) => {
              if (!invoice) return;
              handleFetchCustomer(invoice).catch((err) => console.log(err));
            })
            .catch(() => console.log('error'));
        }}
        className={`w-2/3 pt-14 mt-10 flex flex-col gap-3 relative ${
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
              Mode Pengembalian
            </label>
          </div>
          <div className="w-2/3">
            <select
              value={mode}
              disabled={loading}
              name="change-of-stock-mode"
              onChange={(e) => {
                if (
                  e.target.value === 'return' ||
                  e.target.value === 'exchange' ||
                  e.target.value === 'void'
                )
                  setMode(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Pilih mode
              </option>
              <option value={'return'}>Pengembalian</option>
              <option value={'exchange'}>Tukar Barang</option>
              <option value={'void'}>Void</option>
            </select>
          </div>
        </div>
        <div className="flex items-center relative">
          <InputField
            loading={loading}
            label="Nomor Invoice"
            labelFor="invoice-number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            additionalStyle="pr-10"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute top-0 right-0 h-full flex items-center justify-center px-3"
          >
            <AiOutlineReload />
          </button>
        </div>
      </form>

      {invoice.items && invoice.items.length > 0 && (
        // Invoice data
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit().catch((e: string) => {
              failNotify(e);
              setTimeout(() => {
                setErrorMessage(null);
              }, 3000);
            });
          }}
          className={`w-2/3 flex flex-col gap-3 relative ${
            loading ? 'p-2' : ''
          }`}
        >
          <div className="my-3 space-y-3 font-regular">
            <hr />
            <h1 className="text-2xl font-bold">Detail Invoice</h1>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <p className="text-md">Customer</p>
                <p className="text-md">{invoice.customer_name}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-md">Total harga</p>
                <p className="text-md">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(invoice.total_price ?? 0)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-md">Methode pembayaran</p>
                <p className="text-md">{invoice.payment_method}</p>
              </div>
              <ul className="my-3 space-y-3 font-regular">
                {invoice.items.map((item, index) => (
                  <li key={index}>
                    <div className="w-full flex justify-between items-center">
                      <div
                        className={`flex ${
                          checkedItems[index] ? 'w-4/5 ' : 'w-full'
                        }`}
                      >
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={checkedItems[index] || mode === 'void'}
                            disabled={mode === 'void' || item.is_returned}
                            onChange={() => {
                              const newCheckedItems = checkedItems;
                              newCheckedItems[index] = !newCheckedItems[index];
                              setCheckedItems([...newCheckedItems]);
                              if (newCheckedItems[index])
                                setSelectedItems([...selectedItems, item]);
                              else {
                                const newSelectedItems = selectedItems.filter(
                                  (selectedItem) => selectedItem.id !== item.id
                                );
                                setSelectedItems([...newSelectedItems]);
                              }
                            }}
                          />
                        </div>
                        <div className="px-3">
                          <label className="text-lg font-semibold">
                            {item.count.toString() +
                              'x ' +
                              item.brand +
                              ' ' +
                              item.motor_type +
                              ' ' +
                              item.part +
                              ' ' +
                              item.available_color}
                            {item.is_returned && ' (Returned)'}
                          </label>
                        </div>
                      </div>
                      {checkedItems[index] &&
                        (mode === 'return' || mode === 'exchange') && (
                          <div className="w-1/5">
                            <input
                              disabled={loading || mode === 'return'}
                              id={'amount'}
                              name={'amount'}
                              type="number"
                              className="placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full
                            "
                              value={
                                // If mode is return, set the amount to the original amount
                                mode === 'return'
                                  ? item.count
                                  : selectedItems.find(
                                      (selectedItem) =>
                                        selectedItem.id === item.id
                                    )?.count
                              }
                              onChange={(e) => {
                                const newAmount = e.target.value;
                                // If amount is not a number > 0, set it to 1
                                if (
                                  isNaN(parseInt(newAmount)) ||
                                  parseInt(newAmount) <= 0
                                ) {
                                  e.target.value = '1';
                                  return;
                                }
                                if (
                                  parseInt(newAmount) <=
                                  parseInt(item.count.toString())
                                ) {
                                  // Check if newAmount is smaller or equal to item.amount
                                  const newSelectedItems = [...selectedItems];
                                  const selectedItemIndex =
                                    newSelectedItems.findIndex(
                                      (selectedItem) =>
                                        selectedItem.id === item.id
                                    );
                                  if (selectedItemIndex !== -1) {
                                    newSelectedItems[selectedItemIndex] = {
                                      ...newSelectedItems[selectedItemIndex],
                                      count: Number(newAmount),
                                    };
                                    setSelectedItems(newSelectedItems);
                                    setErrorMessage(null); // Clear any previous error message
                                  }
                                } else {
                                  setErrorMessage(
                                    'Jumlah tidak bisa lebih dari jumlah asli'
                                  );
                                  e.target.value = e.target.value.slice(0, -1);
                                  setTimeout(() => {
                                    setErrorMessage(null);
                                  }, 3000);
                                }
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {mode === 'void' && (
            <div
              className={`w-full py-10 flex flex-col gap-3 relative ${
                loading ? 'p-2' : ''
              }`}
            >
              <hr className="my-3" />
              <h1 className="text-2xl font-bold">Transaksi Baru</h1>
              <ul className="my-3 space-y-3 font-regular">
                {selectedNewItems.map((newItem, newIndex) => (
                  <li key={newIndex}>
                    <div className="flex flex-row">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex w-full justify-between">
                          <p className="text-lg font-semibold">
                            {newItem.brand +
                              ' ' +
                              newItem.motor_type +
                              ' ' +
                              newItem.part +
                              ' ' +
                              newItem.available_color}
                          </p>
                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={() => {
                              setSelectedNewItems(
                                selectedNewItems.filter(
                                  (item) => item.id !== newItem.id
                                )
                              );
                              setSelectedProducts(
                                selectedProducts.filter(
                                  (p) => p.id !== newItem.id
                                )
                              );
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </div>
                        <InputField
                          label="Jumlah Barang"
                          labelFor="new amount"
                          loading={loading}
                          value={selectedNewItems[newIndex]?.count}
                          onChange={(e) => {
                            if (
                              !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                              e.target.value !== ''
                            )
                              return;
                            const newAmount = e.target.value;
                            if (
                              parseInt(e.target.value) >
                              selectedProducts[newIndex].count +
                                (invoice.items?.find(
                                  (item) =>
                                    item.id === selectedProducts[newIndex].id
                                )?.count ?? 0)
                            ) {
                              setErrorMessage(
                                'Amount cannot be more than the original amount'
                              );
                              e.target.value = e.target.value.slice(0, -1);
                              setTimeout(() => {
                                setErrorMessage(null);
                              }, 3000);
                              return;
                            }

                            // Use map to create a new array with updated amount
                            const updatedSelectedNewItems =
                              selectedNewItems.map((item, i) => {
                                if (i === newIndex)
                                  return {
                                    ...item,
                                    count: parseInt(
                                      newAmount === '' ? '0' : newAmount
                                    ),
                                  };

                                return item;
                              });

                            setSelectedNewItems(updatedSelectedNewItems);
                          }}
                        />

                        <div className="flex justify-end">
                          <p className="text-md">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(
                              (selectedNewItems[newIndex]?.count ?? 0) *
                                selectedNewItems[newIndex].sell_price
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end">
                <p className="text-lg ">Total: &nbsp;</p>
                <p className="text-lg ">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(
                    selectedNewItems.reduce(
                      (acc, item) => acc + item.sell_price * item.count,
                      0
                    )
                  )}
                </p>
              </div>

              <div className="flex justify-end">
                <p className="text-lg font-semibold">
                  Jumlah yang harus dibayar: &nbsp;
                </p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(
                    selectedNewItems.reduce(
                      (acc, item) => acc + item.sell_price * item.count,
                      0
                    ) - (invoice.total_price ?? 0)
                  )}
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red-500"
                disabled={loading}
                onClick={() => setModalOpen(true)}
              >
                + Pilih Produk
              </button>

              <hr />

              <div className="w-full flex justify-between items-center">
                <div className="w-1/3">
                  <label htmlFor={'payment-method'} className="text-md">
                    Methode Pembayaran
                  </label>
                </div>
                <div className="w-2/3 flex justify-start">
                  <div className="w-full">
                    <label
                      htmlFor="cash"
                      className="flex items-center text-center gap-[0.5rem] cursor-pointer w-[max-content]"
                    >
                      Cash
                      <input
                        type="radio"
                        disabled={loading}
                        name="payment-method"
                        id="cash"
                        value="Cash"
                        checked={newTransaction.payment_method === 'Cash'}
                        onChange={(e) => {
                          setNewTransaction({
                            ...newTransaction,
                            payment_method: e.target.value,
                          });
                        }}
                        className="cursor-pointer"
                      />
                    </label>
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="cashless"
                      className="flex items-center text-center gap-[0.5rem] cursor-pointer w-[max-content]"
                    >
                      Cashless
                      <input
                        type="radio"
                        disabled={loading}
                        name="payment-method"
                        id="cashless"
                        value="Cashless"
                        checked={newTransaction.payment_method === 'Cashless'}
                        onChange={(e) => {
                          setNewTransaction({
                            ...newTransaction,
                            payment_method: e.target.value,
                          });
                        }}
                        className="cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              Konfirm
            </button>
            <button
              disabled={loading}
              type="button"
              className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
              onClick={() => navigate(-1)}
            >
              Batal
            </button>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm ">{errorMessage}</p>
          )}
        </form>
      )}

      <TableModal
        placeholder="Cari berdasarkan merek produk"
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        handleSearch={handleSearch}
        title={'Pilih Produk'}
        headerList={
          products.length > 0
            ? ['', 'Nama Produk', 'Posisi Gudang', 'Jumlah Tersedia', 'Harga']
            : []
        }
      >
        {products.length > 0 ? (
          products
            .filter((product) => product.count > 0) // Filter out products with count <= 0
            .map((product, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (selectedProducts.some((p) => p.id === product.id)) {
                    setSelectedProducts(
                      selectedProducts.filter((p) => p.id !== product.id)
                    );
                    setNewTransaction({
                      ...newTransaction,
                      items: newTransaction.items?.filter(
                        (p) => p.id !== product.id
                      ),
                    });
                    setSelectedNewItems(
                      selectedNewItems.filter((p) => p.id !== product.id)
                    );
                  } else {
                    if (!product.id) return;
                    const specialPrice = getSpecialPriceForProduct(product.id);
                    setSelectedProducts([...selectedProducts, product]);
                    setSelectedNewItems([
                      ...selectedNewItems,
                      {
                        id: product.id,
                        count: 1,
                        sell_price:
                          specialPrice !== null
                            ? specialPrice
                            : product.sell_price,
                        brand: product.brand,
                        motor_type: product.motor_type,
                        part: product.part,
                        available_color: product.available_color,
                        purchase_price: product.purchase_price,
                        warehouse_position: product.warehouse_position,
                        is_returned: false,
                      },
                    ]);
                  }
                }}
              >
                <SingleTableItem>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product)}
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
                <SingleTableItem>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(product.sell_price)}
                </SingleTableItem>
              </tr>
            ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">Produk tidak ditemukan</p>
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
}
