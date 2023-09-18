import { db } from 'firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function PurchaseHistoryPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [purchaseList, setPurchaseList] = useState<PurchaseHistory[]>([]);
  const [search, setSearch] = useState('');
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();

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
          where('supplier', '==', param.id)
        );
        const querySnapshot = await getDocs(q);

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
  }, [param.id]);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Purchase Report
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full py-11">
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
          </div>
          <button
            type="button"
            className="px-4 py-2 font-medium text-white bg-gray-600  focus:ring-4 focus:ring-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
