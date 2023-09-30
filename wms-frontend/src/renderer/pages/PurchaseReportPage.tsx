import {
  QueryStartAtConstraint,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function PurchaseHistoryPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const { warehousePosition } = useAuth();
  const [purchaseList, setPurchaseList] = useState<PurchaseHistory[]>([]);
  const [search, setSearch] = useState('');
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );

  const toggleShowProducts = (purchaseId: string) => {
    setShowProductsMap((prevState) => ({
      ...prevState,
      [purchaseId]: !prevState[purchaseId],
    }));
  };

  // Take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!param.id) return; // Check if param.id is defined

        const q = query(
          collection(db, 'purchase_history'),
          where('supplier', '==', param.id),
          warehousePosition !== 'Both'
            ? where('warehouse_position', '==', warehousePosition)
            : where('warehouse_position', 'in', [
                'Gudang Bahan',
                'Gudang Jadi',
              ]),
          orderBy('created_at', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          console.log(doc.id, ' => ', doc.data());
        });

        if (querySnapshot.empty) {
          setPurchaseList([]);
          setLoading(false);
          setNextQuery(null);
          setNextPostsEmpty(true);
          setNextPostsLoading(false);

          return;
        }

        setNextQuery(
          startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
        );

        const historyData: PurchaseHistory[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as PurchaseHistory;
          data.id = doc.id;
          historyData.push(data);
        });

        setPurchaseList(historyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [param.id, warehousePosition]);

  const fetchMoreData = async () => {
    try {
      if (nextQuery === null) return;
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'purchase_history'),
        where('supplier', '==', param.id),
        warehousePosition !== 'Both'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('created_at', 'desc'),
        nextQuery,
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setNextPostsEmpty(true);
        setNextQuery(null);
        setNextPostsLoading(false);
        setNextPostsEmpty(true);
        return;
      }

      setNextQuery(() =>
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
      );

      const invoiceData: PurchaseHistory[] = [];
      querySnapshot.forEach((theInvoice) => {
        const data = theInvoice.data() as PurchaseHistory;
        data.id = theInvoice.id;
        invoiceData.push(data);
      });

      setPurchaseList((prev) => [...prev, ...invoiceData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <div className="flex w-2/3 flex-col md:flex-row">
              <button
                type="button"
                className="pr-6 font-2xl  text-gray-600 focus:ring-4 focus:ring-gray-300 rounded-lg text-sm w-[max-content] flex justify-center gap-2 text-center items-center"
                onClick={() => navigate(-1)}
              >
                <IoChevronBackOutline size={40} /> {/* Icon */}
              </button>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                Purchase Report
              </h1>
            </div>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className="py-3">Invoice ID</th>
                <th className="py-3">Date</th>
                <th className="py-3">Purchase Price</th>
                <th className="py-3">Status</th>
                <th className="py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {purchaseList
                  .filter((purchase_history) => {
                    if (!purchase_history.id) return false;
                    if (search === '') return true;
                    return purchase_history.id
                      .toLowerCase()
                      .includes(search.toLowerCase());
                  })
                  .sort((a, b) => {
                    return a.time > b.time ? -1 : 1;
                  })
                  .sort((a, b) => {
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  })
                  .map((purchase_history, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className="border-b hover:shadow-md cursor-pointer"
                        onClick={() => {
                          if (!purchase_history.id) return;
                          toggleShowProducts(purchase_history.id);
                        }}
                      >
                        <SingleTableItem>{purchase_history.id}</SingleTableItem>
                        <SingleTableItem>
                          {purchase_history.created_at}
                        </SingleTableItem>
                        <SingleTableItem>
                          <span className="font-medium text-md">
                            {purchase_history.purchase_price}
                          </span>
                        </SingleTableItem>
                        <SingleTableItem>
                          <form>
                            <select
                              value={purchase_history.payment_status.toLowerCase()}
                              disabled={loading}
                              id="purchase_history"
                              name="purchase_history"
                              onChange={(e) => {
                                const newPurchaseList = [...purchaseList];
                                newPurchaseList[index].payment_status =
                                  e.target.value;
                                setPurchaseList(newPurchaseList);

                                // Update the data in firebase
                                if (!purchase_history.id) return;
                                const purchaseRef = doc(
                                  db,
                                  'purchase_history',
                                  purchase_history.id
                                );
                                purchase_history.payment_status =
                                  e.target.value;
                                updateDoc(purchaseRef, {
                                  payment_status: e.target.value,
                                }).catch((error) => console.log(error));
                              }}
                              className={` ${
                                purchase_history.payment_status.toLowerCase() ===
                                'unpaid'
                                  ? 'bg-red-400'
                                  : 'bg-green-400'
                              } border border-gray-300 text-gray-900 text-sm rounded-lg outline-none block w-fit p-2.5`}
                            >
                              <option className="bg-gray-50" value="unpaid">
                                Unpaid
                              </option>
                              <option className="bg-gray-50" value="paid">
                                Paid
                              </option>
                            </select>
                          </form>
                        </SingleTableItem>
                        <SingleTableItem>
                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={() => {
                              setLoading(true);
                              if (!purchase_history.id) return;
                              const purchaseRef = doc(
                                db,
                                'purchase_history',
                                purchase_history.id
                              );
                              deleteDoc(purchaseRef)
                                .then(() => {
                                  const newPurchaseList = [...purchaseList];
                                  newPurchaseList.splice(index, 1);
                                  setPurchaseList(newPurchaseList);
                                })
                                .catch((error) => console.log(error));
                              setLoading(false);
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </SingleTableItem>
                      </tr>
                      {purchase_history.id &&
                        showProductsMap[purchase_history.id] && (
                          <tr className="border-b">
                            <td colSpan={5}>
                              {' '}
                              {purchase_history.products.map(
                                (product, productIndex) => (
                                  <div
                                    key={productIndex}
                                    className="py-[0.75rem]"
                                  >
                                    <div>
                                      {product.name}: {product.quantity}x
                                    </div>
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-center w-full pt-5">
              <button
                className={
                  'bg-gray-300 hover:bg-gray-400 text-white px-6 py-1 rounded text-sm'
                }
                hidden={nextPosts_empty}
                disabled={nextPosts_loading}
                onClick={() => {
                  fetchMoreData().catch(() => console.log('error'));
                }}
              >
                {nextPosts_loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
