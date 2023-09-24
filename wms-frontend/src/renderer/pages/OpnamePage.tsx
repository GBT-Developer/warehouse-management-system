import { format } from 'date-fns';
import { db } from 'firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BarChart } from 'renderer/components/BarChart';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function OpnamePage() {
  const [salesStats, setSalesStats] = useState<{
    total_sales: number;
    transaction_count: number;
    daily_sales: Record<string, number>;
  }>();
  const [tax, setTax] = useState(10);
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

  useEffect(() => {
    if (startDate === endDate) return;

    const fetchInvoiceList = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'invoice'),
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
        const invoiceListDoc = await getDocs(q);

        const invoices: Invoice[] = [];
        let totalPurchasePrice = 0;
        invoiceListDoc.forEach((invoice) => {
          const data = invoice.data() as Invoice;
          data.id = invoice.id;
          invoices.push(data);
        });

        invoices.forEach((invoice) => {
          invoice.items?.forEach((item) => {
            totalPurchasePrice += item.purchase_price * item.count;
          });
        });

        setPurchasePrice(totalPurchasePrice);
        setInvoiceList(invoices);
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
        };

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

    fetchInvoiceStats()
      .then(() => fetchInvoiceList())
      .catch(() => console.log('error'));
  }, [startDate, endDate]);

  return (
    <PageLayout>
      <div className="relative flex flex-col w-2/3 h-full pt-4">
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Opname
          </h1>
        </div>
        <div className="flex flex-col justify-center">
          <p>Date Range:</p>
          <DateRangeComp
            {...{ startDate, endDate, setStartDate, setEndDate }}
          />
        </div>
        <div className="w-full h-2/5">
          <BarChart data={salesStats?.daily_sales} chartTitle="Sales Chart" />
        </div>
        <div className="w-full h-[fit-content] flex flex-col gap-4">
          <p className="text-2xl font-bold">Summary</p>
          <div className="w-full flex justify-between items-center">
            <div className="w-1/3">
              <p className="text-md">Total Sales: </p>
            </div>
            <div className="w-2/3 flex gap-2 items-center">
              <p>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(salesStats?.total_sales ? salesStats.total_sales : 0)}
              </p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="w-1/3">
              <p className="text-md">Total Profit: </p>
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
              <p className="text-md">Tax to be payed: </p>
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
        <hr className="my-4" />
        <div className="relative flex flex-col justify-between h-[fit-content]">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-1 mb-[1rem]">
            <p className="text-2xl font-bold">Transaction List</p>
          </div>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Date</th>
                <th className=" py-3">Customer Name</th>
                <th className=" py-3">Total Purchase</th>
                <th className=" py-3">Payment Method</th>
                <th className=" py-3">Invoice Number</th>
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
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
