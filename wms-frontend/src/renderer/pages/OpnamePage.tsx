import { format } from 'date-fns';
import {
  QueryStartAtConstraint,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BarChart } from 'renderer/components/BarChart';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { db } from 'renderer/firebase';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function OpnamePage() {
  const [salesStats, setSalesStats] = useState<{
    total_sales: number;
    transaction_count: number;
    daily_sales: Record<string, number>;
    month: number;
  }>();
  const { user } = useAuth();
  const [tax, setTax] = useState(10);
  const { warehousePosition } = useAuth();
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
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
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );

  useEffect(() => {
    if (startDate === endDate) return;

    const fetchInvoiceList = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'invoice'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          warehousePosition !== 'Semua Gudang'
            ? where('warehouse_position', '==', warehousePosition)
            : where('warehouse_position', 'in', [
                'Gudang Bahan',
                'Gudang Jadi',
              ]),
          orderBy('date', 'desc'),
          limit(50)
        );
        const invoiceListDoc = await getDocs(q);

        if (invoiceListDoc.empty) {
          setInvoiceList([]);
          setLoading(false);
          setNextPostsEmpty(true);
          return;
        }

        setNextQuery(() =>
          startAfter(invoiceListDoc.docs[invoiceListDoc.size - 1])
        );

        const invoices: Invoice[] = [];
        let totalPurchasePrice = 0;
        invoiceListDoc.forEach((invoice) => {
          const data = invoice.data() as Invoice;
          data.id = invoice.id;
          invoices.push(data);
        });

        invoices.forEach((invoice) => {
          if (invoice.total_price && invoice.total_price > 0)
            invoice.items?.forEach((item) => {
              totalPurchasePrice += item.purchase_price * item.count;
            });
        });

        setPurchasePrice(totalPurchasePrice);
        setInvoiceList(invoices);
        return invoices;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    // Fetch the data
    const fetchInvoiceStats = async () => {
      setLoading(true);
      try {
        const statsDocRef = doc(db, 'invoice', '--stats--');
        const statsDoc = await getDoc(statsDocRef);
        const statsDocData = statsDoc.data() as {
          total_sales: number;
          transaction_count: number;
          daily_sales: Record<string, number>;
          month: number;
        } | null;

        if (!statsDocData) {
          setLoading(false);
          return;
        }

        for (
          let date = new Date(startDate);
          date <= new Date(endDate);
          date.setDate(date.getDate() + 1)
        ) {
          // Take the date of the current iteration
          const currentDate = format(date, 'dd');
          if (!statsDocData.daily_sales[currentDate])
            statsDocData.daily_sales[currentDate] = 0;
        }

        setSalesStats(statsDocData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchInvoiceList()
      .then((invoices) => {
        if (!invoices || invoices?.length === 0) {
          setSalesStats({
            total_sales: 0,
            transaction_count: 0,
            daily_sales: {},
            month: new Date().getMonth(),
          });
          setPurchasePrice(0);
          return;
        }
        fetchInvoiceStats();
      })
      .catch(() => console.log('error'));
  }, [startDate, endDate, warehousePosition]);

  const fetchMoreData = async () => {
    try {
      if (nextQuery === null) return;
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'invoice'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
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

      setInvoiceList((prev) => [...prev, ...invoiceData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Opname
        </h1>
      </div>
      <div className="relative flex flex-col w-2/3 h-[fit-content] pt-4">
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="flex flex-col justify-center">
          <p>Periode tanggal:</p>
          <DateRangeComp
            {...{ startDate, endDate, setStartDate, setEndDate }}
          />
        </div>
        <div className="w-full min-h-[30rem]">
          <BarChart
            data={salesStats?.daily_sales}
            chartTitle="Grafik Penjualan"
          />
        </div>
        {user?.role.toLocaleLowerCase() === 'owner' && (
          <div className="w-full h-[fit-content] flex flex-col gap-4">
            <p className="text-2xl font-bold">Rangkuman</p>
            <div className="w-full flex justify-between items-center">
              <div className="w-1/3">
                <p className="text-md">Total Penjualan: </p>
              </div>
              <div className="w-2/3 flex gap-2 items-center">
                <p>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(
                    salesStats?.total_sales ? salesStats.total_sales : 0
                  )}
                </p>
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="w-1/3">
                <p className="text-md">Total Keuntungan: </p>
              </div>
              <div className="w-2/3 flex gap-2 items-center">
                <p>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format((salesStats?.total_sales ?? 0) - purchasePrice)}
                </p>
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="w-1/3">
                <p className="text-md">Pajak yang harus dibayar: </p>
              </div>
              <div className="w-2/3 flex gap-2 items-center">
                <p>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(salesStats?.total_sales ?? 0)}
                </p>
                <p>x</p>
                <input
                  className={
                    'placeholder:text-xs text-center placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1 w-[3rem]'
                  }
                  type="text"
                  value={tax}
                  onChange={(e) => {
                    if (
                      !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                      e.target.value !== ''
                    )
                      return;
                    setTax(Number(e.target.value));
                  }}
                />
                <p>% &nbsp; =</p>
                <p>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(((salesStats?.total_sales ?? 0) * tax) / 100)}
                </p>
              </div>
            </div>
          </div>
        )}
        <hr className="my-4" />
        <div className="relative flex flex-col justify-between h-[fit-content]">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-1 mb-[1rem]">
            <p className="text-2xl font-bold">List Transaksi</p>
          </div>
          <div className="overflow-y-auto h-full relative">
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Tanggal</th>
                <th className=" py-3">Nama Customer</th>
                <th className=" py-3">Total Pembelian</th>
                <th className=" py-3">Methode Pembayaran</th>
                <th className=" py-3">Nomor Invoice</th>
              </TableHeader>
              <tbody>
                {invoiceList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={4}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  invoiceList.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <SingleTableItem>{invoice.date}</SingleTableItem>
                      <SingleTableItem>{invoice.customer_name}</SingleTableItem>
                      <SingleTableItem>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(invoice.total_price ?? 0)}
                      </SingleTableItem>
                      <SingleTableItem>
                        {invoice.payment_method}
                      </SingleTableItem>
                      <SingleTableItem>{invoice.id}</SingleTableItem>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <p className="text-gray-500 text-sm">No more data</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => fetchMoreData()}
                >
                  {nextPosts_loading ? (
                    <div className="flex justify-center items-center">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                    </div>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
