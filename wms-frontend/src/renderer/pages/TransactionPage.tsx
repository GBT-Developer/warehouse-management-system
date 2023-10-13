import { format } from 'date-fns';
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
import { FormEvent, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { PdfViewer } from 'renderer/components/PdfViewer';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { db } from 'renderer/firebase';
import { Customer } from 'renderer/interfaces/Customer';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';
export const TransactionPage = () => {
  const navigate = useNavigate();
  const { warehousePosition } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
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
    time: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [guestFormOpen, setGuestFormOpen] = useState(false);
  const successNotify = () =>
    toast.success('Transaksi berhasil dilakukan', {
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
    toast.error(e ?? 'Transaksi gagal dilakukan', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const [isEmpty, setIsEmpty] = useState(false);
  const [clickedInvoice, setClickedInvoice] = useState<Invoice | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customerQuery = query(collection(db, 'customer'));
        setLoading(true);
        const querySnapshot = await getDocs(customerQuery);

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

  useEffect(() => {
    if (!initialLoad) navigate('/');

    setInitialLoad(false);
  }, [warehousePosition]);
  // Check all of the input empty or not
  useEffect(() => {
    if (invoice.items?.length === 0) {
      if (invoice.payment_method === '') {
        setIsEmpty(true);
        return;
      } else if (invoice.payment_method != '') {
        setIsEmpty(true);
        return;
      }
    } else if (invoice.payment_method != '' && invoice.items?.length != 0) {
      const hasZeroCount = invoice.items?.some((item) => item.count === 0);
      const allItemsNonZero = invoice.items?.every((item) => item.count !== 0);

      if (hasZeroCount) {
        setIsEmpty(true); // Set to true if any item has count === 0
      } else if (allItemsNonZero) {
        setIsEmpty(false); // Set to false if all items have count !== 0
      }
    }
  }, [invoice]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (invoice.items?.length === 0 || invoice.payment_method === '') {
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

        const currentDate = format(new Date(), 'yyyy-MM-dd');
        const currentTime = format(new Date(), 'HH:mm:ss');

        for (const item of invoice.items) {
          if (!item.id) return Promise.reject('Product id not found');
          const decrementStock = increment(-1 * item.count);
          const productRef = doc(db, 'product', item.id);
          transaction.update(productRef, {
            count: decrementStock,
          });
        }

        // Update invoice stats
        const statsRef = doc(db, 'invoice', '--stats--');
        const dailySales = new Map<string, FieldValue>();
        const datePriceMap = new Map<string, number>();
        invoice.items.forEach((item) => {
          const date = format(new Date(currentDate), 'dd');
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
            daily_sales:
              invoice.payment_method?.toLowerCase() === 'cash'
                ? {
                    cash: Object.fromEntries(dailySales),
                  }
                : {
                    cashless: Object.fromEntries(dailySales),
                  },
          },
          { merge: true }
        );

        // Add new invoice
        const newInvoiceRef = doc(collection(db, 'invoice'));
        const totalPrice = invoice.items.reduce(
          (acc, item) => acc + item.sell_price * item.count,
          0
        );

        transaction.set(newInvoiceRef, {
          customer_id: selectedCustomer?.id ?? '',
          customer_name: selectedCustomer?.name ?? invoice.customer_name,
          date: currentDate,
          time: currentTime,
          total_price: totalPrice,
          payment_method: invoice.payment_method,
          warehouse_position: invoice.items[0].warehouse_position,
          items: invoice.items,
        });
        setLoading(false);

        setClickedInvoice({
          id: newInvoiceRef.id,
          customer_id: selectedCustomer?.id ?? '',
          customer_name: selectedCustomer?.name ?? invoice.customer_name,
          date: currentDate,
          time: currentTime,
          total_price: totalPrice,
          payment_method: invoice.payment_method,
          warehouse_position: invoice.items[0].warehouse_position,
          items: invoice.items,
        });
        setPdfOpen(true);
        successNotify();
        return Promise.resolve();
      }).catch((error) => {
        const errorMessage = error as unknown as string;
        failNotify(errorMessage);
      });

      // Clear invoice
      setInvoice({
        customer_id: '',
        customer_name: '',
        date: '',
        warehouse_position: '',
        total_price: 0,
        payment_method: '',
        items: [],
        time: '',
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
      and(
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
        ),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi'])
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
        Transaksi
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
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'supplier-id'} className="text-md">
              Pilih customer
            </label>
          </div>
          <div className="w-2/3">
            <select
              value={selectedCustomer?.id ?? ''}
              disabled={loading}
              name="supplier-id"
              onChange={(e) => {
                if (e.target.value === 'New Customer')
                  navigate('/customer-list/new');
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
                Pilih customer
              </option>
              {customerList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
              <option value="New Customer">Customer Baru</option>
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
                    label="Jumlah"
                    labelFor="amount"
                    loading={loading}
                    value={item.count}
                    onChange={(e) => {
                      if (isNaN(Number(e.target.value))) return;
                      if (
                        parseInt(e.target.value) > selectedProducts[index].count
                      ) {
                        setErrorMessage(
                          'Stock di gudang tidak cukup. Stock di gudang: ' +
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
          <p className="text-lg font-semibold">Total Harga: &nbsp;</p>
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
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Konfirm
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
      {clickedInvoice && (
        <PdfViewer
          products={[]}
          setInvoice={setClickedInvoice}
          dispatchNote={undefined}
          setDipatchNote={() => {}}
          modalOpen={pdfOpen}
          setModalOpen={setPdfOpen}
          invoice={clickedInvoice}
          destinationName={clickedInvoice.customer_name ?? ''}
        />
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
                          supplier: product.supplier,
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
              <p className="flex justify-center">Cari produk</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
};
