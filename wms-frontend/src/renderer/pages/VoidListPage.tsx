import { db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function VoidListPage() {
  const [search, setSearch] = useState('');
  const [voidList, setVoidList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  // Take void list from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'void_invoice'));
        const querySnapshot = await getDocs(q);

        const voidData: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Invoice;
          data.id = doc.id;
          voidData.push(data);
        });
        setVoidList(voidData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  // Create a function to format the currency
  function formatCurrency(amount: number | undefined) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount ?? 0);
  }

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
              List Void
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className="py-3">Void Invoice ID</th>
                <th className="py-3">Nama Customer</th>
                <th className="py-3">Tanggal</th>
                <th className="py-3">Metode Pembayaran</th>
                <th className="py-3">Total Harga</th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {voidList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={6}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  voidList
                    .filter((void_list) => {
                      if (!void_list.id || !void_list.customer_name)
                        return false;
                      if (search === '') return true;
                      return (
                        void_list.id
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        void_list.customer_name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      );
                    })
                    .sort((a, b) => {
                      if (a.date === undefined || b.date === undefined)
                        return 0;
                      return (
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      );
                    })
                    .map((void_list, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className="border-b hover:shadow-md cursor-pointer"
                          onClick={() => {
                            if (!void_list.id) return;
                            toggleShowProducts(void_list.id);
                          }}
                        >
                          <SingleTableItem>{void_list.id}</SingleTableItem>
                          <SingleTableItem>
                            {void_list.customer_name}
                          </SingleTableItem>
                          <SingleTableItem>{void_list.date}</SingleTableItem>
                          <SingleTableItem>
                            {void_list.payment_method}
                          </SingleTableItem>
                          <SingleTableItem>
                            {formatCurrency(void_list.total_price)}
                          </SingleTableItem>
                        </tr>
                        {void_list.id && showProductsMap[void_list.id] && (
                          <tr className="border-b">
                            <td colSpan={5}>
                              {' '}
                              {void_list.items?.map((product, productIndex) => (
                                <div
                                  key={productIndex}
                                  className="py-[0.75rem]"
                                >
                                  <div>
                                    {product.brand}: {product.count}x
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
