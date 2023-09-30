import {
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  query,
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
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const q = query(
        collectionGroup(db, 'invoice'),
        warehousePosition !== 'Both'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi'])
      );

      const querySnapshot = await getDocs(q);

      const stockHistoryData: Invoice[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as Invoice;
        if (data.date === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
      });

      // Set stock history sorted by date
      stockHistoryData.sort((a, b) => {
        if (a.date === undefined || b.date === undefined) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setInvoiceHistory(stockHistoryData);
      setLoading(false);
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [warehousePosition]);
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
              Riwayat Transaksi
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
                <th className=" py-3">Tangga</th>
                <th className=" py-3">Nomor Invoice</th>
                <th className=" py-3">Nama Customer</th>
                <th className=" py-3">Posisi Gudang</th>
                <th className=" py-3">Total Harga</th>
                <th className=" py-3">Methode Pembayaran</th>
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
                                .catch((error) => failNotify(error));
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
                                      {product.brand}: {product.count}x
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
