import { db } from 'firebase';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';
export default function TransactionHistory() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const q = query(collectionGroup(db, 'invoice'));

      const querySnapshot = await getDocs(q);

      const stockHistoryData: Invoice[] = [];
      querySnapshot.forEach((theStockHistory) => {
        const data = theStockHistory.data() as Invoice;
        if (data.date === undefined) return;
        data.id = theStockHistory.id;
        stockHistoryData.push(data);
      });

      //set stock history sorted by date
      stockHistoryData.sort((a, b) => {
        if (a.date === undefined || b.date === undefined) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setInvoiceHistory(stockHistoryData);
      console.log(stockHistoryData);
      setLoading(false);
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);
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
                <th className=" py-3">Warehouse</th>
                <th className=" py-3">Sales</th>
                <th className=" py-3">Payment</th>
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
                  .map((invoiceHistory: Invoice, index) => (
                    <tr key={index} className="border-b">
                      <SingleTableItem>{invoiceHistory.date}</SingleTableItem>
                      <SingleTableItem>{invoiceHistory.id}</SingleTableItem>
                      <SingleTableItem>
                        {invoiceHistory.items
                          ? invoiceHistory.items[0].warehouse_position
                          : ''}
                      </SingleTableItem>
                      <SingleTableItem>
                        {invoiceHistory.items
                          ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(
                              parseInt(invoiceHistory.total_price ?? '0')
                            )
                          : ''}
                      </SingleTableItem>
                      <SingleTableItem>
                        {invoiceHistory.payment_method}
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
