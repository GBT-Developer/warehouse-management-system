import { addDays, format } from 'date-fns';
import { db } from 'firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BarChart } from 'renderer/components/BarChart';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function OpnamePage() {
  const [sales, setSales] = useState<Map<string, number>>();
  const [loading, setLoading] = useState(false);
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

    // Fetch the data
    const fetchInvoiceList = async () => {
      setLoading(true);
      try {
        const invoiceQuery = query(
          collection(db, 'invoice'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
        const querySnapshot = await getDocs(invoiceQuery);

        const invoiceData: Invoice[] = [];
        const theSales = new Map<string, number>();
        querySnapshot.forEach((theInvoice) => {
          const data = theInvoice.data() as Invoice;
          data.id = theInvoice.id;
          invoiceData.push(data);
          if (data.date && data.total_price) {
            const date = format(new Date(data.date), 'dd');
            const total_price = data.total_price;
            const currentTotal = theSales.get(date);
            if (currentTotal) theSales.set(date, currentTotal + total_price);
            else theSales.set(date, total_price);
          }
        });

        // Fill in the empty sales between the dates from startDate to endDate
        const currentDate = new Date(startDate);
        while (currentDate <= addDays(new Date(endDate), 1)) {
          const date = format(currentDate, 'dd');
          if (!theSales.has(date)) theSales.set(date, 0);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Sort the sales by date
        const sortedSales = new Map(
          Array.from(theSales.entries()).sort(
            ([dateA], [dateB]) => parseInt(dateA) - parseInt(dateB)
          )
        );

        setSales(sortedSales);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchInvoiceList().catch(() => console.log('error'));
  }, [startDate, endDate]);

  return (
    <PageLayout>
      <div className="relative flex flex-col w-2/3 h-full pt-4">
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Opname
        </h1>
        <DateRangeComp {...{ startDate, endDate, setStartDate, setEndDate }} />
        <div className="w-full h-2/5">
          <BarChart
            data={sales}
            chartTitle="Sales Chart"
            chartSubTitle={`Total sales: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(
              Array.from(sales?.values() ? sales.values() : []).reduce(
                (a, b) => a + b,
                0
              )
            )}`}
          />
        </div>
      </div>
    </PageLayout>
  );
}
