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
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import DateRangeComp from 'renderer/components/DateRangeComp';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function VoidListPage() {
  const [search, setSearch] = useState('');
  const [voidList, setVoidList] = useState<Invoice[]>([]);
  const [filteredVoidList, setFilteredVoidList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const { warehousePosition } = useAuth();
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
  // Take void list from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'void_invoice'),
          warehousePosition !== 'Semua Gudang'
            ? where('warehouse_position', '==', warehousePosition)
            : where('warehouse_position', 'in', [
                'Gudang Bahan',
                'Gudang Jadi',
              ]),
          orderBy('date', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length === 0) {
          setVoidList([]);
          setLoading(false);
          return;
        }

        const voidData: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Invoice;
          data.id = doc.id;
          voidData.push(data);
        });

        const nextQ = startAfter(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );

        setNextQuery(nextQ);

        setVoidList(voidData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
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
    const filteredVoidList = voidList.filter((void_list) => {
      const voidListDate = new Date(void_list.date ?? '');
      // Check if the invoice date is within the date range
      return voidListDate >= startDateObj && voidListDate <= endDateObj;
    });
    setFilteredVoidList(filteredVoidList);
  }, [startDate, endDate, voidList]);

  // Fetch next posts
  const fetchNextPosts = async () => {
    try {
      if (nextQuery === null) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'void_invoice'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('date', 'desc'),
        limit(50),
        nextQuery
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length === 0) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      const voidData: Invoice[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Invoice;
        data.id = doc.id;
        voidData.push(data);
      });

      const nextQ = startAfter(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );

      setNextQuery(nextQ);

      setVoidList((prevState) => [...prevState, ...voidData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
          <div className="flex flex-col justify-center">
            <p>Periode tanggal:</p>
            <DateRangeComp
              {...{ startDate, endDate, setStartDate, setEndDate }}
            />
          </div>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className="py-3">Tanggal</th>
                <th className="py-3">Void Invoice ID</th>
                <th className="py-3">Nama Customer</th>
                <th className="py-3">Metode Pembayaran</th>
                <th className="py-3">Total Harga</th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {voidList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={6}>
                      <p className="flex justify-center">Data tidak tersedia</p>
                    </td>
                  </tr>
                ) : (
                  filteredVoidList
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
                      return a.time > b.time ? -1 : 1;
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
                          <SingleTableItem>
                            <span className="font-medium text-md">
                              {void_list.date}
                              <br />
                              <span className="text-sm font-normal">
                                {void_list.time}
                              </span>
                            </span>
                          </SingleTableItem>
                          <SingleTableItem>{void_list.id}</SingleTableItem>
                          <SingleTableItem>
                            {void_list.customer_name}
                          </SingleTableItem>
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
                                    <span>{product.brand + ' '}</span>
                                    <span>{product.motor_type + ' '}</span>
                                    <span>{product.part + ' '}</span>
                                    <span>{product.available_color}:</span>{' '}
                                    <span>{product.count}x</span>
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
