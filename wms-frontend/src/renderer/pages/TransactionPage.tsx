import { format } from 'date-fns';
import { db } from 'firebase';
import {
  FieldValue,
  and,
  collection,
  doc,
  getDocs,
  increment,
  or,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import React, { FormEvent, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Customer } from 'renderer/interfaces/Customer';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export const TransactionPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [invoice, setInvoice] = useState<Invoice>({
    customer_id: '',
    customer_name: '',
    date: '',
    warehouse_position: '',
    total_price: 0,
    payment_method: '',
    items: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const [guestFormOpen, setGuestFormOpen] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const productsQuery = query(collection(db, 'customer'));
        setLoading(true);
        const querySnapshot = await getDocs(productsQuery);

        const customerData: Customer[] = [];
        querySnapshot.forEach((theCustomer) => {
          const data = theCustomer.data() as Customer;
          data.id = theCustomer.id;
          customerData.push(data);
        });

        // Set Customer List sorted by name
        setCustomerList(
          customerData.sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
          })
        );
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCustomer().catch((error) => {
      console.log(error);
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      invoice.items?.length === 0 ||
      invoice.payment_method === '' ||
      !invoice.date
    ) {
      setErrorMessage('Please fill all fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    try {
      setLoading(true);
      // Update product count
      runTransaction(db, (transaction) => {
        if (!invoice.items) return Promise.reject();
        for (const item of invoice.items) {
          if (!item.id) return Promise.reject('Product id not found');
          const currentProduct = selectedProducts.find((p) => p.id === item.id);
          if (!currentProduct) return Promise.reject();
          const decrementStock = increment(-1 * item.count);
          const productRef = doc(db, 'product', item.id);
          transaction.update(productRef, {
            count: decrementStock,
          });
        }

        const incrementTransaction = increment(1);
        const incrementTotalSales = increment(
          invoice.items.reduce(
            (acc, item) => acc + item.sell_price * item.count,
            0
          )
        );
        const statsRef = doc(db, 'invoice', '--stats--');
        const dailySales = new Map<string, FieldValue>();
        const datePriceMap = new Map<string, number>();
        invoice.items.forEach((item) => {
          if (!invoice.date) return;
          const date = format(new Date(invoice.date), 'dd');
          const total_price = item.sell_price * item.count;
          const currentTotal = datePriceMap.get(date);
          if (currentTotal) {
            const currentIncrement = increment(total_price + currentTotal);
            datePriceMap.set(date, currentTotal + total_price);
            dailySales.set(date, currentIncrement);
          } else {
            const currentIncrement = increment(total_price);
            datePriceMap.set(date, total_price);
            dailySales.set(date, currentIncrement);
          }
        });
        transaction.set(
          statsRef,
          {
            transaction_count: incrementTransaction,
            total_sales: incrementTotalSales,
            daily_sales: Object.fromEntries(dailySales),
          },
          { merge: true }
        );
        const totalPrice = invoice.items.reduce(
          (acc, item) => acc + item.sell_price * item.count,
          0
        );
        if (selectedCustomer?.id) {
          const newInvoiceRef = doc(db, 'invoice', selectedCustomer.id);
          transaction.set(newInvoiceRef, {
            customer_id: selectedCustomer.id,
            customer_name: selectedCustomer.name,
            // Current date
            date: invoice.date,
            total_price: totalPrice,
            payment_method: invoice.payment_method,
            items: invoice.items,
          });
        } else {
          const newInvoiceRef = doc(db, 'invoice');

          transaction.set(newInvoiceRef, {
            customer_id: '',
            customer_name: invoice.customer_name,
            // Current date
            date: invoice.date,
            total_price: totalPrice,
            payment_method: invoice.payment_method,
            items: invoice.items,
          });
        }
        return Promise.resolve();
      }).catch((error) => console.error('Transaction failed: ', error));

      // Clear invoice
      setInvoice({
        customer_id: '',
        customer_name: '',
        date: '',
        warehouse_position: '',
        total_price: 0,
        payment_method: '',
        items: [],
      });
      setSelectedProducts([]);
      setSelectedCustomer(null);
      setProducts([]);
      setLoading(false);
      setGuestFormOpen(false);
    } catch (error) {
      console.error('Error adding document: ', error);
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
        Transaction
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
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
            <label htmlFor={'supplier-id'} className="text-md">
              Choose customer
            </label>
          </div>
          <div className="w-2/3">
            <select
              value={selectedCustomer?.id ?? ''}
              disabled={loading}
              name="supplier-id"
              onChange={(e) => {
                if (e.target.value === 'New Customer')
                  navigate('/input-customer');
                if (e.target.value === 'Guest') {
                  setSelectedCustomer(null);
                  setGuestFormOpen(true);
                } else {
                  setGuestFormOpen(false);
                  setSelectedCustomer(
                    () =>
                      customerList.find(
                        (customer) => customer.id === e.target.value
                      ) ?? null
                  );
                  setSelectedProducts([]);
                  setInvoice({
                    ...invoice,
                    customer_id: e.target.value,
                    items: [],
                  });
                }
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value={''} disabled>
                Choose customer
              </option>
              {customerList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
              <option value="New Customer">New Customer</option>
              <option key="Guest" value="Guest">
                Guest
              </option>
            </select>{' '}
          </div>
        </div>

        {guestFormOpen && (
          <div className="flex flex-col gap-3">
            <InputField
              label="Guest Name"
              labelFor="customer-name"
              loading={loading}
              value={invoice.customer_name ?? ''}
              onChange={(e) => {
                setInvoice({ ...invoice, customer_name: e.target.value });
              }}
            />
          </div>
        )}

        <hr />

        <ul className="my-3 space-y-3 font-regular">
          {invoice.items?.map((item, index) => (
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
                        setInvoice({
                          ...invoice,
                          items: invoice.items?.filter((p) => p.id !== item.id),
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
                        parseInt(e.target.value) > selectedProducts[index].count
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
                      setInvoice({
                        ...invoice,
                        items: invoice.items?.map((i, idx) => {
                          if (idx === index) i.count = Number(e.target.value);

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
              invoice.items?.reduce(
                (acc, item) => acc + item.sell_price * item.count,
                0
              ) ?? 0
            )}
          </p>
        </div>

        <button
          type="button"
          className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red-500"
          disabled={!selectedCustomer && !guestFormOpen}
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
                    setInvoice({ ...invoice, payment_method: e.target.value });
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
                  checked={invoice.payment_method === 'Cashless'}
                  onChange={(e) => {
                    setInvoice({ ...invoice, payment_method: e.target.value });
                  }}
                  className="cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Transaction Date
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
                setInvoice(() => ({ ...invoice, date: e.target.value }));
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
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
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
                  setInvoice({
                    ...invoice,
                    items: invoice.items?.filter((p) => p.id !== product.id),
                  });
                } else {
                  if (!product.id) return;
                  setSelectedProducts([...selectedProducts, product]);
                  setInvoice({
                    ...invoice,
                    items: [
                      ...(invoice.items ?? []),
                      {
                        id: product.id,
                        count: 1,
                        sell_price:
                          selectedCustomer?.SpecialPrice.find(
                            (p) => p.product_id === product.id
                          )?.price ?? product.sell_price,
                        brand: product.brand,
                        motor_type: product.motor_type,
                        part: product.part,
                        available_color: product.available_color,
                        warehouse_position: product.warehouse_position,
                        purchase_price: product.purchase_price,
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
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
};
