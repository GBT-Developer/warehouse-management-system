import { db } from 'firebase';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { StockHistory } from 'renderer/interfaces/StockHistory';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function StockHistoryPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { warehousePosition } = useAuth();
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collectionGroup(db, 'stock_history'),
        warehousePosition !== 'Both'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi'])
      );

      const querySnapshot = await getDocs(q);

      const stockHistoryData: StockHistory[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as StockHistory;
        if (data.created_at === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
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

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Stock History
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
                <th className=" py-3">Product</th>
                <th className=" py-3">Warehouse</th>
                <th className=" py-3">Old count</th>
                <th className=" py-3">New count</th>
                <th className=" py-3">Difference</th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {stockHistory.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={6}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  stockHistory
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
                          {stock_history.created_at}
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

export default StockHistoryPage;
