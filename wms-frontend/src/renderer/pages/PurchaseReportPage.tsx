import { db } from 'firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { Purchase_History } from 'renderer/interfaces/PurchaseHistory';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function PurchaseHistoryPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [purchaseList, setPurchaseList] = useState<Purchase_History[]>([]);
  const [search, setSearch] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<Purchase_History[]>(
    []
  );
  const navigate = useNavigate();
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

        const historyData: Purchase_History[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Purchase_History;
          data.id = doc.id;
          historyData.push(data);
        });
        const myquery = query(
          collection(db, 'product'),
          where('supplier', '==', param.id)
        );
        const productSnapshot = await getDocs(myquery);
        productSnapshot.forEach((doc) => {
          historyData.forEach((history) => {
            if (history.product && doc.id === history.product)
              history.product = doc.data() as Product;
          });
        });
        setPurchaseList(historyData);
        setFilteredHistory(historyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [param.id]);

  useEffect(() => {
    setFilteredHistory(
      purchaseList.filter((purchase) => {
        if (purchase.product)
          return purchase.product.brand
            .concat(
              ' ',
              purchase.product.motor_type,
              ' ',
              purchase.product.part,
              ' ',
              purchase.product.available_color
            )
            .toLowerCase()
            .includes(search.toLowerCase());
      })
    );
  }, [search, purchaseList]);

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
                <th className="py-3">Product Name</th>
                <th className="py-3">Date</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {filteredHistory.map(
                  (purchase_history: Purchase_History, index) => (
                    <tr
                      key={index}
                      className="border-b hover:shadow-md cursor-pointer"
                    >
                      <SingleTableItem>
                        {purchase_history.product &&
                          purchase_history.product.brand +
                            ' ' +
                            purchase_history.product.motor_type +
                            ' ' +
                            purchase_history.product.part +
                            ' ' +
                            purchase_history.product.available_color}
                      </SingleTableItem>
                      <SingleTableItem>
                        {purchase_history.created_at}
                      </SingleTableItem>
                      <SingleTableItem>
                        {purchase_history.count}
                      </SingleTableItem>
                      <SingleTableItem>
                        <span className="font-medium text-md">
                          {purchase_history.purchase_price}
                        </span>
                      </SingleTableItem>
                      <SingleTableItem>
                        <form>
                          <select
                            value={purchase_history.payment_status}
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
                              purchase_history.payment_status = e.target.value;
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
                        >
                          <BiSolidTrash />
                        </button>
                      </SingleTableItem>
                    </tr>
                  )
                )}
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
