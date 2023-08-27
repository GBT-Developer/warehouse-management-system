import { db } from 'firebase';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { StockHistory } from 'renderer/interfaces/StockHistory';
import { PageLayout } from 'renderer/layout/PageLayout';

function StockHistoryPage() {
  const [search, setSearch] = useState('');
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collectionGroup(db, 'stock_history'));

      const querySnapshot = await getDocs(q);

      const stockHistoryData: StockHistory[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as StockHistory;
        if (data.updated_at === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
      });

      setStockHistory(stockHistoryData);

      console.log(
        'KOKO',
        querySnapshot.docs.map((doc) => doc.data())
      );
    };

    console.log('search', search);

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch} />
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <TableHeader>
                <td className="px-4 py-3">Date</td>
                <td className="px-4 py-3">Old count</td>
                <td className="px-4 py-3">New count</td>
                <td className="px-4 py-3">Difference</td>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {stockHistory.map((stock_history: StockHistory, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <SingleTableItem>
                      {stock_history.updated_at?.toDate().toLocaleDateString()}
                    </SingleTableItem>
                    <SingleTableItem>{stock_history.old_count}</SingleTableItem>
                    <SingleTableItem>{stock_history.new_count}</SingleTableItem>
                    <SingleTableItem>
                      <div className="flex items-center justify-between">
                        {stock_history.difference}
                        {Number(stock_history.difference) > 0 ? (
                          <GoTriangleUp size={23} className="text-green-500" />
                        ) : (
                          <GoTriangleDown size={23} className="text-red-500" />
                        )}
                      </div>
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default StockHistoryPage;
