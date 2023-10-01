import { format } from 'date-fns';
import {
  collection,
  documentId,
  getDocs,
  or,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FcComboChart } from 'react-icons/fc';
import { GiMoneyStack } from 'react-icons/gi';
import { db } from 'renderer/firebase';
import { Invoice } from 'renderer/interfaces/Invoice';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function HomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);

  useEffect(() => {
    const fetchSupplierPurchase = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'purchase_history'),
          or(
            where('payment_status', '==', 'Unpaid'),
            where('payment_status', '==', 'unpaid')
          )
        );
        const purchaseHistoryDoc = await getDocs(q);

        const purchaseHistoryData: PurchaseHistory[] = [];
        purchaseHistoryDoc.forEach((purchase) => {
          const data = purchase.data() as PurchaseHistory;
          data.id = purchase.id;
          purchaseHistoryData.push(data);
        });

        // Save all supplier to map without double
        const supplierMap: Supplier[] = [];
        purchaseHistoryData.forEach((purchase) => {
          if (purchase.supplier)
            if (!supplierMap.includes(purchase.supplier))
              supplierMap.push(purchase.supplier);
        });

        if (supplierMap.length > 0) {
          // Fetch the supplier data
          const q2 = query(
            collection(db, 'supplier'),
            where(documentId(), 'in', supplierMap)
          );
          const supplierDoc = await getDocs(q2);

          const supplierData: Supplier[] = [];
          supplierDoc.forEach((supplier) => {
            const data = supplier.data() as Supplier;
            data.id = supplier.id;
            supplierData.push(data);
          });

          // Replace the supplier data in purchase history
          purchaseHistoryData.forEach((purchase) => {
            supplierData.forEach((supplier) => {
              const supplierId = purchase.supplier as unknown as string;
              if (supplierId === supplier.id) purchase.supplier = supplier;
            });
          });
        }

        setPurchaseHistory(purchaseHistoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    const fetchTodaysInvoice = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'invoice'),
          where('date', '==', format(new Date(), 'yyyy-MM-dd'))
        );
        const invoiceListDoc = await getDocs(q);

        const invoices: Invoice[] = [];
        let totalPurchasePrice = 0;
        invoiceListDoc.forEach((invoice) => {
          const data = invoice.data() as Invoice;
          data.id = invoice.id;
          invoices.push(data);
        });

        invoices.forEach((invoice) => {
          invoice.items?.forEach((item) => {
            totalPurchasePrice += item.sell_price * item.count;
          });
        });

        setPurchasePrice(totalPurchasePrice);
        setInvoiceList(invoices);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchTodaysInvoice()
      .then(() => {
        fetchSupplierPurchase().catch((error) => {
          console.log(error);
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden pr-10">
        <div className="relative sm:rounded-lg overflow-auto h-full flex flex-col">
          {loading && (
            <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
              <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
            </div>
          )}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
            <h1 className="text-4xl tracking-tight text-gray-900 md:text-5xl">
              <span>Halo,</span>{' '}
              <span className="font-extrabold">{user?.display_name}!</span>
            </h1>
          </div>

          <div className="flex py-10 gap-10">
            <div className="w-1/2">
              <p className="font-semibold">Today's Revenue</p>
              <div className="flex flex-col w-full pt-2 justify-center">
                <div className="flex gap-7 items-center justify-between">
                  <p className="font-bold text-5xl overflow-hidden overflow-ellipsis">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(purchasePrice)}
                  </p>
                  <p className="text-8xl">
                    <FcComboChart />
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {invoiceList.length} Orders
                </p>
              </div>
            </div>

            <div className="w-1/2">
              <p className="font-semibold">Unpaid Invoices</p>
              <div className="flex flex-col w-full pt-2 justify-center">
                <div className="flex gap-7 items-center justify-between">
                  <p className="font-bold text-5xl">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(
                      purchaseHistory.reduce(
                        (acc, curr) => (acc += curr.purchase_price),
                        0
                      )
                    )}
                  </p>
                  <p className="text-8xl">
                    <GiMoneyStack />
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {purchaseHistory.length} Invoices
                </p>
              </div>
            </div>
          </div>

          <hr className="bg-gray-300" />

          <div className="flex py-10 gap-[0.75rem] h-full px-2 overflow-hidden">
            <div className="w-full h-full shadow-lg rounded-md py-6 px-4 overflow-y-scroll">
              <p className="font-semibold pb-8">Recent Orders</p>
              <table className="w-full text-sm">
                <tbody className="text-gray-500">
                  {invoiceList.map((invoice) => {
                    return (
                      <tr key={invoice.id} className="border-b py-3">
                        <td>{invoice.id}</td>
                        <td>{invoice.customer_name}</td>
                        <td>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(invoice.total_price ?? 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <hr className="w-[1px] h-full border-none inline-block bg-white" />

            <div className="w-full h-full shadow-lg rounded-md py-6 px-4">
              <p className="font-semibold pb-8">Unpaid Invoices</p>
              <table className="w-full text-sm">
                <tbody className="text-gray-500">
                  {purchaseHistory.map((purchase) => {
                    return (
                      <tr key={purchase.id} className="border-b py-3">
                        <td>{purchase.id}</td>
                        <td>{purchase.supplier?.company_name}</td>
                        <td>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(purchase.purchase_price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
export default HomePage;
