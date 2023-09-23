import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
} from 'chart.js';
import { addDays, format } from 'date-fns';
import { db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function OpnamePage() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [tax, setTax] = useState(''); // State for the tax percentage [0, 100]
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalWeek0, setTotalWeek0] = useState(0); // State for the total sales for week 0 [0, 100]
  const [totalWeeek1, setTotalWeek1] = useState(0);
  const [totalWeeek2, setTotalWeek2] = useState(0);
  const [totalWeeek3, setTotalWeek3] = useState(0);
  const [totalWeeek4, setTotalWeek4] = useState(0);
  const [averageSales, setAverageSales] = useState(0.0);
  const [averageRevenue, setAverageRevenue] = useState(0.0);
  const [totalTransaction, setTotalTransaction] = useState(0);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const myRef = useRef(null); // Initialize the ref with null
  const data = {
    labels: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Sales Report', // Change 'labels' to 'label'
        data: [totalWeek0, totalWeeek1, totalWeeek2, totalWeeek3, totalWeeek4],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: true, // or false, depending on whether you want to display the legend
      },
    },
    scales: {
      y: {
        min: 0, // Minimum value for the y-axis
        max: 10, // Maximum value for the y-axis
      },
      // Add more scale configurations if needed (e.g., x-axis).
    },
    maintainAspectRatio: false, // Set to false to have a fixed size chart, otherwise it will take up the whole container
  };
  //state for date range
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);
  const startDate = format(range[0].startDate, 'yyyy-MM-dd'); // Get the start date from the range state
  const endDate = format(range[0].endDate, 'yyyy-MM-dd'); // Get the end date from the range state
  //take invoice data from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const invoiceQuery = query(collection(db, 'invoice'));
        const querySnapshot = await getDocs(invoiceQuery);

        const invoiceData: Invoice[] = [];
        querySnapshot.forEach((theInvoice) => {
          const data = theInvoice.data() as Invoice;
          data.id = theInvoice.id;
          // Check if the invoice's created_at date is within the specified time range
          const invoiceDateRaw = data.date; // Store the raw date string
          if (invoiceDateRaw) {
            const invoiceDate = format(new Date(invoiceDateRaw), 'yyyy-MM-dd');
            // Check if the invoice's created_at date is within the specified time range
            if (invoiceDate >= startDate && invoiceDate <= endDate) {
              invoiceData.push(data);
            }
          }
        });
        setInvoiceList(invoiceData);
        setLoading(false);

        //take product data from firebase
        const productQuery = query(collection(db, 'product'));
        const querySnapshot2 = await getDocs(productQuery);

        const productData: Product[] = [];
        querySnapshot2.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
        });

        setProducts(productData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [invoiceList]);
  //calculate total sales
  useEffect(() => {
    let totalSales = 0;
    let total = 0;
    invoiceList.forEach((invoice) => {
      const priceAsNumber = invoice?.total_price
        ? parseInt(invoice.total_price)
        : 0;
      totalSales += priceAsNumber;
      total += 1;
    });

    setTotalSales(totalSales);
    setTotalTransaction(total);
    //average sales
    setAverageSales(totalTransaction / 31);
    //average revenue
    setAverageRevenue(totalSales / 31);
  }, [invoiceList]);
  // Calculate Tax
  useEffect(() => {
    if (Number.isNaN(Number(tax))) {
      setErrorMessage('Please enter a valid number');
    } else {
      setErrorMessage(null);
      if (tax !== '') {
        const totalTax = (totalSales * parseInt(tax, 10)) / 100;
        setTotalTax(totalTax);
      } else {
        // Handle the case where tax is empty or not a valid number
        setTotalTax(0);
      }
    }
  }, [tax, totalSales]);
  //calculate total sales each week
  useEffect(() => {
    // Reset totals to 0 when startDate or invoiceList changes
    setTotalWeek1(0);
    setTotalWeek2(0);
    setTotalWeek3(0);
    setTotalWeek4(0);
    invoiceList.forEach((invoice) => {
      const invoiceDate = invoice.date; // Store the raw date string
      if (invoiceDate) {
        if (
          invoiceDate >= startDate &&
          invoiceDate <= format(addDays(new Date(startDate), 7), 'yyyy-MM-dd')
        ) {
          setTotalWeek1((prevTotal) => prevTotal + 1);
        } else if (
          invoiceDate > format(addDays(new Date(startDate), 7), 'yyyy-MM-dd') &&
          invoiceDate <= format(addDays(new Date(startDate), 14), 'yyyy-MM-dd')
        ) {
          setTotalWeek2((prevTotal) => prevTotal + 1);
        } else if (
          invoiceDate >
            format(addDays(new Date(startDate), 14), 'yyyy-MM-dd') &&
          invoiceDate <= format(addDays(new Date(startDate), 21), 'yyyy-MM-dd')
        ) {
          setTotalWeek3((prevTotal) => prevTotal + 1);
        } else if (
          invoiceDate >
            format(addDays(new Date(startDate), 21), 'yyyy-MM-dd') &&
          invoiceDate <= format(addDays(new Date(startDate), 28), 'yyyy-MM-dd')
        ) {
          setTotalWeek4((prevTotal) => prevTotal + 1);
        }
      }
    });
    console.log('week1', totalWeeek1);
    console.log('week2', totalWeeek2);
    console.log('week3', totalWeeek3);
    console.log('week4', totalWeeek4);
  }, [totalTransaction]);
  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Opname
      </h1>
      <div className="flex justify-between">
        <DateRangeComp initRange={range} setRange={setRange} />
      </div>
      <div
        className="flex w-2/3 flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem] w-full"
        ref={myRef}
      >
        <div className="flex flex-col items-left justify-center space-y-3 w-1/3">
          <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3l">
            Total Sales:
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(totalSales)}
            <br></br>
            Total Transaction : {totalTransaction}
          </p>
        </div>
        <div className="flex flex-col items-left justify-center space-y-3 w-1/3">
          <p className="text-3xl font-bold tracking-tight text-gray-900 md:text-5l">
            Total Profit: Rp. {totalProfit},00
          </p>
        </div>
        <div className="flex flex-col items-left justify-center space-y-3 w-1/3">
          <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Total Tax:{' '}
            <input
              type="text"
              placeholder="Enter Tax Percentage"
              className="border border-gray-300 rounded p-2 text-2xl md:text-2xl w-full h-7.5"
              // Add necessary state and event handlers here
              onChange={(e) => {
                setTax(e.target.value);
              }}
            />
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(totalTax)}
          </p>
          {errorMessage && (
            <p className="text-red-500 text-sm ">{errorMessage}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-left justify-center space-y-3">
        <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3l">
          Average Sales: {averageSales}
        </p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3l">
          Average Revenue:{' '}
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(averageRevenue)}
        </p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3l">
          Sales Graph
        </p>
      </div>
      <div className="flex flex-col items-left justify-center space-y-3 w-full h-1/4">
        <Line
          data={data}
          options={options}
          style={{ width: '100%', height: '1000px' }}
        ></Line>
      </div>
    </PageLayout>
  );
}
