import {
  QueryStartAtConstraint,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const successNotify = () => toast.success('Transaction deleted successfully');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Failed to delete transaction');
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'invoice'),
        warehousePosition !== 'Both'
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

  const fetchMoreData = async () => {
    try {
      if (nextQuery === null) return;
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'invoice'),
        warehousePosition !== 'Both'
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
  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Transaction History
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Date</th>
                <th className=" py-3">Invoice Number</th>
                <th className=" py-3">Customer Name</th>
                <th className=" py-3">Warehouse</th>
                <th className=" py-3">Sales</th>
                <th className=" py-3">Payment</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {invoiceHistory
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
                          {mapInvoiceHistory.date}
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
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLoading(true);
                              if (!mapInvoiceHistory.id) return;
                              const purchaseRef = doc(
                                db,
                                'invoice',
                                mapInvoiceHistory.id
                              );
                              deleteDoc(purchaseRef)
                                .then(() => {
                                  const newInvoiceHistroy = [...invoiceHistory];
                                  newInvoiceHistroy.splice(index, 1);
                                  setInvoiceHistory(newInvoiceHistroy);
                                })
                                .catch(() => failNotify());
                              setLoading(false);
                              successNotify();
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
            <div className="flex justify-center w-full pt-5">
              <button
                className={
                  'bg-gray-300 hover:bg-gray-400 text-white px-6 py-1 rounded text-sm'
                }
                hidden={nextPosts_empty}
                disabled={nextPosts_loading}
                onClick={() => {
                  fetchMoreData().catch(() => console.log('error'));
                }}
              >
                {nextPosts_loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
