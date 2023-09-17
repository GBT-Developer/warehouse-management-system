import { db } from 'firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useState } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function ReturnPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'return' | 'exchange' | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [invoice, setInvoice] = useState<{
    customer_id: string;
    customer_name: string;
    total_price: string;
    payment_method: string;
    items: {
      product_id: string;
      amount: string;
      price: string;
      product_name: string;
      warehouse_position: string;
      is_returned: boolean;
    }[];
  }>({
    customer_id: '',
    customer_name: '',
    total_price: '',
    payment_method: '',
    items: [],
  });
  const [selectedItems, setSelectedItems] = useState<
    {
      product_id: string;
      amount: string;
      price: string;
      product_name: string;
      warehouse_position: string;
      is_returned: boolean;
    }[]
  >([]);

  const handleSubmit = async () => {
    //if mode is exchange,
    if (mode === 'exchange') {
      console.log('exchange');
      await runTransaction(db, async (transaction) => {
        const promises = selectedItems.map(async (item) => {
          // Get product data
          const productRef = doc(db, 'product', item.product_id);
          const productSnap = await getDoc(productRef);
          const product = productSnap.data() as Product;

          // Check if there is enough stock
          if (parseInt(product.count) < parseInt(item.amount)) {
            return Promise.reject();
          }

          // Update product count
          const difference = parseInt(product.count) - parseInt(item.amount);
          console.log('diff' + difference);
          transaction.update(
            doc(db, 'product', item.product_id),
            'count',
            difference.toString()
          );

          // Put the returned product to broken product database
          checkBrokenProduct(product, item.amount);
          return Promise.resolve();
        });
        await Promise.all(promises);

        return Promise.resolve();
      });
    } else if (mode === 'return') {
      console.log('return');
      const newInvoice = { ...invoice };
      //decrease the amount of the item in the invoice
      //if amount is 0, delete the item from the invoice
      selectedItems.forEach((selectedItem) => {
        const itemIndex = newInvoice.items.findIndex(
          (item) => item.product_id === selectedItem.product_id
        );
        if (
          parseInt(newInvoice.items[itemIndex].amount) ===
          parseInt(selectedItem.amount)
        ) {
          //delete the item
          newInvoice.items.splice(itemIndex, 1);
        } else {
          newInvoice.items[itemIndex].amount = (
            parseInt(newInvoice.items[itemIndex].amount) -
            parseInt(selectedItem.amount)
          ).toString();
        }
      });

      // merge the invoice items with the selected items
      // but if the item is already in the invoice, just increase the amount
      selectedItems.forEach((selectedItem) => {
        const itemIndex = newInvoice.items.findIndex(
          (item) => item.product_id === selectedItem.product_id
        );
        if (itemIndex === -1) {
          newInvoice.items.push(selectedItem);
        } else {
          newInvoice.items[itemIndex].amount = (
            parseInt(newInvoice.items[itemIndex].amount) +
            parseInt(selectedItem.amount)
          ).toString();
        }
      });

      //update the invoice
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'invoice', invoiceNumber), {
          items: newInvoice.items,
        });

        // Put the returned product to broken product database
        const promises = selectedItems.map(async (item) => {
          // Get product data
          const productRef = doc(db, 'product', item.product_id);
          const productSnap = await getDoc(productRef);
          const product = productSnap.data() as Product;

          // Check if there is enough stock
          checkBrokenProduct(product, item.amount);
          return Promise.resolve();
        });
      });
    }
    // Clear the form
    setInvoiceNumber('');
    setCheckedItems([]);
    setInvoice({
      customer_id: '',
      customer_name: '',
      total_price: '',
      payment_method: '',
      items: [],
    });
    setSelectedItems([]);
    setMode('');
    setLoading(false);
  };

  const checkBrokenProduct = async (
    product: Product | undefined,
    amount: string
  ) => {
    if (!product) return;
    // Check if the product is already in broken product database
    const brokenProductQuery = query(
      collection(db, 'broken_product'),
      where('warehouse_position', '==', 'Gudang Jadi'),
      where('available_color', '==', product.available_color),
      where('brand', '==', product.brand),
      where('motor_type', '==', product.motor_type),
      where('part', '==', product.part),
      where('supplier', '==', product.supplier)
    );

    const brokenProductQuerySnapshot = await getDocs(brokenProductQuery);

    if (brokenProductQuerySnapshot.empty) {
      await addDoc(collection(db, 'broken_product'), {
        ...product,
        count: amount,
        warehouse_position: 'Gudang Jadi',
      });
    } else {
      // Update broken product count
      const brokenProduct = brokenProductQuerySnapshot.docs[0];

      await updateDoc(brokenProduct.ref, {
        count:
          parseInt(amount) + parseInt((brokenProduct.data() as Product).count),
      });
    }
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
        total_price: string;
        payment_method: string;
        items: {
          product_id: string;
          amount: string;
          price: string;
          product_name: string;
          warehouse_position: string;
          is_returned: boolean;
        }[];
      };

      if (!invoiceData) {
        setErrorMessage('Invoice not found');
        console.log('Invoice not found');
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
        className={`w-2/3 pt-14 mt-10 flex flex-col gap-3 relative${
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
                  e.target.value === 'exchange'
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
            onClick={() => handleFetchInvoice()}
          >
            <AiOutlineReload />
          </button>
        </div>
      </form>

      {invoice.items.length > 0 && (
        //invoice data
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit().catch(() => {
              setErrorMessage('An error occured while submitting data');
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
                <p className="text-md">{invoice.total_price}</p>
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
                            disabled={item.is_returned}
                            onChange={(e) => {
                              const newCheckedItems = checkedItems;
                              newCheckedItems[index] = !newCheckedItems[index];
                              setCheckedItems([...newCheckedItems]);
                              if (newCheckedItems[index]) {
                                setSelectedItems([...selectedItems, item]);
                                console.log(selectedItems);
                              } else {
                                const newSelectedItems = selectedItems.filter(
                                  (selectedItem) =>
                                    selectedItem.product_id !== item.product_id
                                );
                                setSelectedItems([...newSelectedItems]);
                              }
                            }}
                          />
                        </div>
                        <div className="px-3">
                          <label className="text-lg font-semibold">
                            {item.amount + 'x ' + item.product_name}
                            {item.is_returned && ' (Returned)'}
                          </label>
                        </div>
                      </div>
                      {checkedItems[index] && (
                        <div className="w-1/5">
                          <input
                            disabled={loading}
                            id={'amount'}
                            name={'amount'}
                            type="number"
                            className="placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full
                            "
                            onChange={(e) => {
                              const newAmount = e.target.value;
                              if (
                                parseInt(newAmount) <= parseInt(item.amount)
                              ) {
                                // Check if newAmount is smaller or equal to item.amount
                                const newSelectedItems = [...selectedItems];
                                const selectedItemIndex =
                                  newSelectedItems.findIndex(
                                    (selectedItem) =>
                                      selectedItem.product_id ===
                                      item.product_id
                                  );
                                if (selectedItemIndex !== -1) {
                                  newSelectedItems[selectedItemIndex] = {
                                    ...newSelectedItems[selectedItemIndex],
                                    amount: newAmount,
                                    is_returned: true,
                                  };
                                  setSelectedItems(newSelectedItems);
                                  console.log(newSelectedItems);
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
    </PageLayout>
  );
}
