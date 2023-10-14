import { format } from 'date-fns';
import {
  QueryStartAtConstraint,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { StockHistory } from 'renderer/interfaces/StockHistory';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function StockHistoryPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [filteredStockHistory, setFilteredStockHistory] = useState<
    StockHistory[]
  >([]);
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );
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
      const q = query(
        collection(db, 'stock_history'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStockHistory([]);
        setLoading(false);
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      const stockHistoryData: StockHistory[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as StockHistory;
        if (data.created_at === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
      });

      const nextQ = startAfter(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );

      setNextQuery(nextQ);
      // Set stock history sorted by date
      stockHistoryData.sort((a, b) => {
        if (a.created_at === undefined || b.created_at === undefined) return 0;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      // Sort based the new count and old count of the same product on the same date
      for (let i = 0; i < stockHistoryData.length; i++)
        for (let j = i + 1; j < stockHistoryData.length; j++)
          if (
            stockHistoryData[i].product === stockHistoryData[j].product &&
            stockHistoryData[i].created_at === stockHistoryData[j].created_at &&
            stockHistoryData[i].old_count ===
              stockHistoryData[j].old_count + stockHistoryData[j].difference
          ) {
            const temp = stockHistoryData[i];
            stockHistoryData[i] = stockHistoryData[j];
            stockHistoryData[j] = temp;
          }

      setStockHistory(stockHistoryData);
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
    const filteredStockHistory = stockHistory.filter((stockHistory) => {
      const stockHistoryDate = new Date(stockHistory.created_at ?? '');
      // Check if the invoice date is within the date range
      return stockHistoryDate >= startDateObj && stockHistoryDate <= endDateObj;
    });
    setFilteredStockHistory(filteredStockHistory);
  }, [startDate, endDate, stockHistory]);

  const fetchNextPosts = async () => {
    if (nextQuery === null) {
      setNextPostsEmpty(true);
      setNextPostsLoading(false);
      return;
    }
    setNextPostsLoading(true);
    const q = query(
      collection(db, 'stock_history'),
      warehousePosition !== 'Semua Gudang'
        ? where('warehouse_position', '==', warehousePosition)
        : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
      orderBy('created_at', 'desc'),
      limit(50),
      nextQuery
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setNextPostsEmpty(true);
      setNextPostsLoading(false);
      setNextPostsEmpty(true);
      setNextPostsLoading(false);
      return;
    }

    const stockHistoryData: StockHistory[] = [];
    querySnapshot.forEach((theStockHistory) => {
      const data = theStockHistory.data() as StockHistory;
      if (data.created_at === undefined) return;
      data.id = theStockHistory.id;
      stockHistoryData.push(data);
    });

    const nextQ = startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]);

    setNextQuery(nextQ);
    // Set stock history sorted by date
    stockHistoryData.sort((a, b) => {
      if (a.created_at === undefined || b.created_at === undefined) return 0;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // Sort based the new count and old count of the same product on the same date
    for (let i = 0; i < stockHistoryData.length; i++)
      for (let j = i + 1; j < stockHistoryData.length; j++)
        if (
          stockHistoryData[i].product === stockHistoryData[j].product &&
          stockHistoryData[i].created_at === stockHistoryData[j].created_at &&
          stockHistoryData[i].old_count ===
            stockHistoryData[j].old_count + stockHistoryData[j].difference
        ) {
          const temp = stockHistoryData[i];
          stockHistoryData[i] = stockHistoryData[j];
          stockHistoryData[j] = temp;
        }

    setStockHistory([...stockHistory, ...stockHistoryData]);
    setNextPostsLoading(false);
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Riwayat Stock
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
                <th className=" py-3">Nama Produk</th>
                <th className=" py-3">Posisi Gudang</th>
                <th className=" py-3">Jumlah Lama</th>
                <th className=" py-3">Jumlah Baru</th>
                <th className=" py-3">Selisih</th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {stockHistory.length > 0 &&
                  filteredStockHistory
                    .filter((stockHistory) => {
                      if (search === '') return stockHistory;
                      else if (
                        stockHistory.product_name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        stockHistory.warehouse_position
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        stockHistory.created_at?.toLowerCase().includes(search)
                      )
                        return stockHistory;
                    })
                    .sort((a, b) => {
                      if (a.time === undefined || b.time === undefined)
                        return 0;
                      return a.time > b.time ? -1 : 1;
                    })
                    .sort((a, b) => {
                      if (
                        a.created_at === undefined ||
                        b.created_at === undefined
                      )
                        return 0;
                      return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                      );
                    })
                    .map((stock_history: StockHistory, index) => (
                      <tr key={index} className="border-b">
                        <SingleTableItem>
                          <span className="font-medium text-md">
                            {stock_history.created_at}
                            <br />
                            <span className="text-sm font-normal">
                              {stock_history.time}
                            </span>
                          </span>
                        </SingleTableItem>
                        <SingleTableItem>
                          {stock_history.product_name}
                        </SingleTableItem>
                        <SingleTableItem>
                          {stock_history.warehouse_position}
                        </SingleTableItem>
                        <SingleTableItem>
                          {stock_history.old_count}
                        </SingleTableItem>
                        <SingleTableItem>
                          {stock_history.old_count + stock_history.difference}
                        </SingleTableItem>
                        <SingleTableItem>
                          <div className="flex items-center justify-between">
                            {stock_history.difference}
                            {Number(stock_history.difference) > 0 ? (
                              <GoTriangleUp
                                size={23}
                                className="text-green-500"
                              />
                            ) : (
                              <GoTriangleDown
                                size={23}
                                className="text-red-500"
                              />
                            )}
                          </div>
                        </SingleTableItem>
                      </tr>
                    ))}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <p className="text-gray-500 text-sm">Data tidak tersedia</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={fetchNextPosts}
                  disabled={nextPosts_loading}
                >
                  {nextPosts_loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                  ) : (
                    'Selanjutnya'
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

export default StockHistoryPage;
