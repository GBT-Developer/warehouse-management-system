import { format } from 'date-fns';
import {
  FieldValue,
  QueryStartAtConstraint,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { PiFilePdfBold } from 'react-icons/pi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { PdfViewer } from 'renderer/components/PdfViewer';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function TransactionHistory() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const successNotify = () =>
    toast.success('Transaksi berhasil dihapus', {
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
    toast.error(e ?? 'Transaksi gagal dihapus', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );
  const [clickedInvoice, setClickedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Take the first date of the month as the start date
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
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'invoice'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('date', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setInvoiceHistory([]);
        setLoading(false);
        setNextQuery(null);
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      setNextQuery(
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
      );

      const stockHistoryData: Invoice[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as Invoice;
        if (data.date === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
      });

      setInvoiceHistory(stockHistoryData);
      setLoading(false);
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [warehousePosition]);

  //filter by date
  useEffect(() => {
    // Convert startDate and endDate to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Use the filter method to filter invoices within the date range
    const filteredInvoices = invoiceHistory.filter((invoice) => {
      const invoiceDate = new Date(invoice.date ?? '');
      // Check if the invoice date is within the date range
      return invoiceDate >= startDateObj && invoiceDate <= endDateObj;
    });
    setFilteredInvoices(filteredInvoices);
  }, [startDate, endDate, invoiceHistory]);

  const fetchMoreData = async () => {
    try {
      if (nextQuery === null) return;
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'invoice'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('date', 'desc'),
        nextQuery,
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setNextPostsEmpty(true);
        setNextQuery(null);
        setNextPostsLoading(false);
        return;
      }

      setNextQuery(() =>
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
      );

      const invoiceData: Invoice[] = [];
      querySnapshot.forEach((theInvoice) => {
        const data = theInvoice.data() as Invoice;
        data.id = theInvoice.id;
        invoiceData.push(data);
      });

      setInvoiceHistory((prev) => [...prev, ...invoiceData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Show product
  const toggleShowProducts = (purchaseId: string) => {
    setShowProductsMap((prevState) => ({
      ...prevState,
      [purchaseId]: !prevState[purchaseId],
    }));
  };

  const handleDeleteInvoice = async (mapInvoiceHistory: Invoice) => {
    setLoading(true);

    await runTransaction(db, async (transaction) => {
      if (!mapInvoiceHistory.id) return;

      // Delete the invoice
      const purchaseRef = doc(db, 'invoice', mapInvoiceHistory.id);
      transaction.delete(purchaseRef);
      setInvoiceHistory((prev) =>
        prev.filter((invoice) => invoice.id !== mapInvoiceHistory.id)
      );

      // Decrement the daily sales on invoice/--stats-- document
      const statsRef = doc(db, 'invoice', '--stats--');
      const dailySales = new Map<string, FieldValue>();
      const datePriceMap = new Map<string, number>();
      const currentDate = format(new Date(), 'yyyy-MM-dd');

      mapInvoiceHistory?.items?.forEach((item) => {
        const date = format(new Date(currentDate), 'dd');
        const total_price = item.sell_price * item.count;
        const currentTotal = datePriceMap.get(date);
        if (currentTotal) {
          const currentIncrement = increment(-1 * (total_price + currentTotal));
          datePriceMap.set(date, currentTotal + total_price);
          dailySales.set(date, currentIncrement);
        } else {
          const currentIncrement = increment(-1 * total_price);
          datePriceMap.set(date, total_price);
          dailySales.set(date, currentIncrement);
        }
      });

      transaction.set(
        statsRef,
        {
          daily_sales:
            mapInvoiceHistory.payment_method?.toLowerCase() === 'cash'
              ? {
                  cash: Object.fromEntries(dailySales),
                }
              : {
                  cashless: Object.fromEntries(dailySales),
                },
        },
        {
          merge: true,
        }
      );
    });

    setLoading(false);
    successNotify();
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Riwayat Transaksi
            </h1>
          </TableTitle>
          <div className="flex flex-col justify-center">
            <p>Periode tanggal:</p>
            <DateRangeComp
              {...{ startDate, endDate, setStartDate, setEndDate }}
            />
          </div>
          <div className="overflow-y-auto h-full">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Tanggal</th>
                <th className=" py-3">Nomor Invoice</th>
                <th className=" py-3">Nama Customer</th>
                <th className=" py-3">Posisi Gudang</th>
                <th className=" py-3">Total Harga</th>
                <th className=" py-3">Methode Pembayaran</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {filteredInvoices
                  .filter((invoiceHistory) => {
                    if (invoiceHistory.id === undefined) return;
                    if (search === '') return invoiceHistory;
                    else if (
                      invoiceHistory.id
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                      return invoiceHistory;
                  })
                  .sort((a, b) => {
                    return a.time > b.time ? -1 : 1;
                  })
                  .sort((a, b) => {
                    if (a.date === undefined || b.date === undefined) return 0;
                    return (
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                  })
                  .map((mapInvoiceHistory: Invoice, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className="border-b hover:shadow-md cursor-pointer"
                        onClick={() => {
                          if (!mapInvoiceHistory.id) return;
                          toggleShowProducts(mapInvoiceHistory.id);
                        }}
                      >
                        <SingleTableItem>
                          <span className="font-medium text-md">
                            {mapInvoiceHistory.date}
                            <br />
                            <span className="text-sm font-normal">
                              {mapInvoiceHistory.time}
                            </span>
                          </span>
                        </SingleTableItem>
                        <SingleTableItem>
                          {mapInvoiceHistory.id}
                        </SingleTableItem>
                        <SingleTableItem>
                          {mapInvoiceHistory.customer_name}
                        </SingleTableItem>
                        <SingleTableItem>
                          {mapInvoiceHistory.items
                            ? mapInvoiceHistory.items[0].warehouse_position
                            : ''}
                        </SingleTableItem>
                        <SingleTableItem>
                          {mapInvoiceHistory.items
                            ? new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                              }).format(mapInvoiceHistory.total_price ?? 0)
                            : ''}
                        </SingleTableItem>
                        <SingleTableItem>
                          {mapInvoiceHistory.payment_method}
                        </SingleTableItem>
                        <SingleTableItem>
                          <button
                            type="button"
                            className="text-blue-500 text-lg p-2 hover:text-blue-700 cursor-pointer bg-transparent rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!mapInvoiceHistory.id) return;
                              setClickedInvoice(mapInvoiceHistory);
                              setModalOpen(true);
                            }}
                          >
                            <PiFilePdfBold size={20} />
                          </button>

                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInvoice(mapInvoiceHistory).catch(
                                (error) => failNotify(error)
                              );
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </SingleTableItem>
                      </tr>
                      {mapInvoiceHistory.id &&
                        showProductsMap[mapInvoiceHistory.id] && (
                          <tr className="border-b">
                            <td colSpan={6}>
                              {mapInvoiceHistory.items?.map(
                                (product, productIndex) => (
                                  <div
                                    key={productIndex}
                                    className="py-[0.75rem]"
                                  >
                                    <div>
                                      <span>{product.brand + ' '}</span>
                                      <span>{product.motor_type + ' '}</span>
                                      <span>{product.part + ' '}</span>
                                      <span>
                                        {product.available_color}:
                                      </span>{' '}
                                      <span>{product.count}x</span>
                                      {product.is_returned && (
                                        <span className="text-red-500">
                                          {' '}
                                          (Dikembalikan)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <p className="text-gray-500 text-sm">Data tidak tersedia</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => {
                    fetchMoreData().catch((error) => console.log(error));
                  }}
                >
                  {nextPosts_loading ? (
                    <div className="flex justify-center items-center">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                    </div>
                  ) : (
                    'Selanjutnya'
                  )}
                </button>
              </div>
            )}
          </div>
          {clickedInvoice && (
            <PdfViewer
              products={[]}
              setInvoice={setClickedInvoice}
              dispatchNote={undefined}
              setDipatchNote={() => {}}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              invoice={clickedInvoice}
              destinationName={clickedInvoice.customer_name ?? ''}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
