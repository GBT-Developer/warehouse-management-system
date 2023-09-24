import { format } from 'date-fns';
import { db } from 'firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BarChart } from 'renderer/components/BarChart';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function OpnamePage() {
  const [salesStats, setSalesStats] = useState<{
    total_sales: number;
    transaction_count: number;
    daily_sales: Record<string, number>;
  }>();
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
            data={salesStats?.daily_sales}
            chartTitle="Sales Chart"
            chartSubTitle={`Total sales: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(salesStats?.total_sales ? salesStats.total_sales : 0)}`}
          />
        </div>
      </div>
    </PageLayout>
  );
}
