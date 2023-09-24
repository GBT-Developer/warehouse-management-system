import { db } from 'firebase';
import {
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  or,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { useState } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

const invoiceInitialState: Invoice = {
  customer_id: '',
  customer_name: '',
  total_price: 0,
  payment_method: '',
  items: [],
};

export default function ReturnPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'return' | 'exchange' | 'void' | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [invoice, setInvoice] = useState<Invoice>(invoiceInitialState);
  const [newInvoice, setNewInvoice] = useState<Invoice>(invoiceInitialState);
  const [selectedItems, setSelectedItems] = useState<
    (Product & {
      is_returned?: boolean;
    })[]
  >([]);

  const handleSubmit = async () => {
    // If mode is exchange, check if there is enough stock
    if (mode === 'exchange')
      await runTransaction(db, async (transaction) => {
        try {
          const promises = selectedItems.map(async (item) => {
            // Get product data
            if (!item.id) return Promise.reject('Product id is undefined');
            const productRef = doc(db, 'product', item.id);
            const productSnap = await getDoc(productRef);
            const product = productSnap.data() as Product;

            // Check if there is enough stock
            if (product.count < item.count)
              return Promise.reject('Not enough stock in the warehouse');

            // Update product count
            const difference = product.count - item.count;
            transaction.update(
              doc(db, 'product', item.id),
              'count',
              difference
            );

            // Put the returned product to broken product database
            transaction.set(
              doc(db, 'broken_product', item.id),
              {
                ...product,
                count: difference,
              },
              { merge: true }
            );

            return Promise.resolve('Success');
          });
          await Promise.all(promises);
          return Promise.resolve('Success'); // If all promises are resolved, return 'Success
        } catch (err) {
          return Promise.reject(err);
        }
      });
    else if (mode === 'return') {
      const newInvoice = { ...invoice };
      // Decrease the count of the item in the invoice
      // If count is 0, delete the item from the invoice
      selectedItems.forEach((selectedItem) => {
        const itemInInvoice = newInvoice.items?.find(
          (item) => item.id === selectedItem.id
        );
        if (itemInInvoice?.count === selectedItem.count)
          // Delete the item
          newInvoice.items?.splice(
            newInvoice.items.findIndex((item) => item.id === selectedItem.id),
            1
          );
        // Decrease the count
        else if (itemInInvoice?.count)
          itemInInvoice.count -= selectedItem.count;
      });

      // Reduce the total price
      if (newInvoice.total_price)
        newInvoice.total_price =
          newInvoice.total_price -
          selectedItems.reduce(
            (acc, cur) => acc + cur.sell_price * cur.count,
            0
          );

      // Merge the invoice items with the selected items
      // But if the item is already in the invoice, just increase the count
      selectedItems.forEach((selectedItem) => {
        selectedItem.is_returned = true;
        const itemIndex = newInvoice.items?.findIndex(
          (item) => item.id === selectedItem.id
        );
        if (itemIndex === -1 || itemIndex === undefined)
          newInvoice.items?.push(selectedItem);
        else if (newInvoice.items)
          newInvoice.items[itemIndex].count =
            newInvoice.items[itemIndex].count - selectedItem.count;
      });

      // Update the invoice
      await runTransaction(db, (transaction) => {
        transaction.update(doc(db, 'invoice', invoiceNumber), {
          items: newInvoice.items,
          total_price: newInvoice.total_price,
        });

        // Put the returned product to broken product database
        const promises = selectedItems.map(async (item) => {
          const brokenProductRef = doc(
            collection(db, 'broken_product'),
            item.id
          );

          const updateCount = increment(item.count);
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

        return Promise.all(promises);
      });
    }
    // Clear the form
    setInvoiceNumber('');
    setCheckedItems([]);
    setInvoice({
      customer_id: '',
      customer_name: '',
      total_price: 0,
      payment_method: '',
      items: [],
    });
    setSelectedItems([]);
    setMode('');
    setLoading(false);
  };

  const handleFetchInvoice = async () => {
    if (!invoiceNumber) return;

    try {
      setLoading(true);
      const invoiceRef = doc(db, 'invoice', invoiceNumber);
      const invoiceSnap = await getDoc(invoiceRef);
      const invoiceData = invoiceSnap.data() as {
        customer_id: string;
        customer_name: string;
        total_price: number;
        payment_method: string;
        items: (Product & {
          is_returned?: boolean;
        })[];
      } | null;

      if (!invoiceData) {
        setErrorMessage('Invoice not found');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        setLoading(false);
        return;
      }

      setInvoice(invoiceData);

      setCheckedItems(new Array(invoiceData.items.length).fill(false));
      setLoading(false);
    } catch (err) {
      setErrorMessage('An error occured while fetching invoice');
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

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl pt-4">
        Return
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          () => handleFetchInvoice();
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
              Change of stock mode
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
                Select mode
              </option>
              <option value={'return'}>Return</option>
              <option value={'exchange'}>Exchange</option>
              <option value={'void'}>Void</option>
            </select>
          </div>
        </div>
        <div className="flex items-center relative">
          <InputField
            loading={loading}
            label="Invoice number"
            labelFor="invoice-number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            additionalStyle="pr-10"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute top-0 right-0 h-full flex items-center justify-center px-3"
            onClick={() => {
              handleFetchInvoice().catch(() => console.log('error'));
            }}
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
              setErrorMessage(e);
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
            <h1 className="text-2xl font-bold">Invoice Details</h1>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <p className="text-md">Customer</p>
                <p className="text-md">{invoice.customer_name}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-md">Total price</p>
                <p className="text-md">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(invoice.total_price ?? 0)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-md">Payment method</p>
                <p className="text-md">{invoice.payment_method}</p>
              </div>
              <ul className="my-3 space-y-3 font-regular">
                {invoice.items.map((item, index) => (
                  <li key={index}>
                    <div className="w-full flex justify-between items-center">
                      <div
                        className={`flex ${
                          checkedItems[index] ? 'w-4/5' : 'w-full'
                        }`}
                      >
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={checkedItems[index]}
                            disabled={item.is_returned ?? mode === 'void'}
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
                      {checkedItems[index] && (
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
                                  'Amount cannot be more than the original amount'
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
              <h1 className="text-2xl font-bold">New Transaction</h1>
              <ul className="my-3 space-y-3 font-regular">
                {newInvoice.items?.map((item, index) => (
                  <li key={index}>
                    <div className="flex flex-row">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex w-full justify-between">
                          <p className="text-lg font-semibold">
                            {selectedProducts[index].brand +
                              ' ' +
                              selectedProducts[index].motor_type +
                              ' ' +
                              selectedProducts[index].part +
                              ' ' +
                              selectedProducts[index].available_color}
                          </p>
                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={() => {
                              setNewInvoice({
                                ...newInvoice,
                                items: newInvoice.items?.filter(
                                  (p) => p.id !== item.id
                                ),
                              });
                              setSelectedProducts(
                                selectedProducts.filter((p) => p.id !== item.id)
                              );
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </div>
                        <InputField
                          label="Amount"
                          labelFor="amount"
                          loading={loading}
                          value={item.count}
                          onChange={(e) => {
                            if (isNaN(Number(e.target.value))) return;
                            if (
                              parseInt(e.target.value) >
                              selectedProducts[index].count
                            ) {
                              setErrorMessage(
                                'Not enough stock in warehouse. Stock in warehouse: ' +
                                  selectedProducts[index].count.toString()
                              );
                              setTimeout(() => {
                                setErrorMessage(null);
                              }, 3000);
                              return;
                            }
                            setNewInvoice({
                              ...invoice,
                              items: invoice.items?.map((i, idx) => {
                                if (idx === index)
                                  i.count = Number(e.target.value);

                                return i;
                              }),
                            });
                          }}
                        />
                        <div className="flex justify-end">
                          <p className="text-md">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(item.sell_price * item.count)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end">
                <p className="text-lg font-semibold">Total: &nbsp;</p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(
                    newInvoice.items?.reduce(
                      (acc, item) => acc + item.sell_price * item.count,
                      0
                    ) ?? 0
                  )}
                  ,00
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red-500"
                disabled={loading}
                onClick={() => setModalOpen(true)}
              >
                Choose Products
              </button>

              <hr />

              <div className="w-full flex justify-between items-center">
                <div className="w-1/3">
                  <label htmlFor={'payment-method'} className="text-md">
                    Payment Method
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
                        checked={invoice.payment_method === 'Cash'}
                        onChange={(e) => {
                          setNewInvoice({
                            ...newInvoice,
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
                        checked={newInvoice.payment_method === 'Cashless'}
                        onChange={(e) => {
                          setNewInvoice({
                            ...newInvoice,
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
      )}

      <TableModal
        placeholder="Search by product brand"
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        handleSearch={handleSearch}
        title={'Choose Product'}
        headerList={
          products.length > 0
            ? ['', 'Product name', 'Warehouse', 'Available amount', 'Price']
            : []
        }
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <tr
              key={index}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (selectedProducts.find((p) => p === product)) {
                  setSelectedProducts(
                    selectedProducts.filter((p) => p !== product)
                  );
                  setNewInvoice({
                    ...newInvoice,
                    items: newInvoice.items?.filter((p) => p.id !== product.id),
                  });
                } else {
                  if (!product.id) return;
                  setSelectedProducts([...selectedProducts, product]);
                  setNewInvoice({
                    ...newInvoice,
                    items: [
                      ...(newInvoice.items ?? []),
                      {
                        ...product,
                        is_returned: false,
                      },
                    ],
                  });
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
              <SingleTableItem>{product.sell_price}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
}
