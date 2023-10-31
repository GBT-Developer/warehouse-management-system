import { FirebaseError } from 'firebase/app';
import {
  collection,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from 'renderer/firebase';

export const DeleteDataModal = ({
  setModalOpen,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // Get current month on the current local time
  const currentMonth = new Date().setDate(1);
  const toBeDeletedMonth = new Date().setMonth(new Date().getMonth() - 1, 1);
  const [loading, setLoading] = useState(false);
  const successNotify = () =>
    toast.success('Data berhasil dihapus', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Data gagal dihapus', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const handleDeleteData = () => {
    runTransaction(db, async (transaction) => {
      setLoading(true);
      // Collections of to be deleted document: stock_history, void, invoice
      const stockHistoryRef = collection(db, 'stock_history');
      const voidRef = collection(db, 'void_invoice');
      const invoiceRef = collection(db, 'invoice');

      const firstDayOfToBeDeletedMonth = new Date(
        new Date(toBeDeletedMonth).getFullYear(),
        new Date(toBeDeletedMonth).getMonth(),
        1
      ).toString();
      const lastDayOfToBeDeletedMonth = new Date(
        new Date(toBeDeletedMonth).getFullYear(),
        new Date(toBeDeletedMonth).getMonth() + 1,
        0
      ).toString();

      const stockHistoryQuery = query(
        stockHistoryRef,
        where('created_at', '>=', firstDayOfToBeDeletedMonth),
        where('created_at', '<=', lastDayOfToBeDeletedMonth)
      );
      const toBeDeletedStockHistory = await getDocs(stockHistoryQuery).catch(
        (error: FirebaseError) => {
          // If permission denied, then throw error
          if (error.code === 'permission-denied') {
            throw new FirebaseError('permission-denied', 'permission-denied');
          } else throw error;
        }
      );

      const voidInvoiceQuery = query(
        voidRef,
        where('date', '>=', firstDayOfToBeDeletedMonth),
        where('date', '<=', lastDayOfToBeDeletedMonth)
      );
      const toBeDeletedVoidInvoice = await getDocs(voidInvoiceQuery).catch(
        (error: FirebaseError) => {
          // If permission denied, then throw error
          if (error.code === 'permission-denied') {
            throw new FirebaseError('permission-denied', 'permission-denied');
          } else throw error;
        }
      );

      const invoiceQuery = query(
        invoiceRef,
        where('date', '>=', firstDayOfToBeDeletedMonth),
        where('date', '<=', lastDayOfToBeDeletedMonth)
      );
      const toBeDeletedInvoice = await getDocs(invoiceQuery).catch(
        (error: FirebaseError) => {
          // If permission denied, then throw error
          if (error.code === 'permission-denied') {
            throw new FirebaseError('permission-denied', 'permission-denied');
          } else throw error;
        }
      );

      // Delete all to be deleted document
      toBeDeletedStockHistory?.forEach(async (doc) => {
        transaction.delete(doc.ref);
      });

      toBeDeletedVoidInvoice?.forEach(async (doc) => {
        transaction.delete(doc.ref);
      });

      toBeDeletedInvoice?.forEach(async (doc) => {
        transaction.delete(doc.ref);
      });

      setLoading(false);
      successNotify();
      setModalOpen(false);
      return;
    }).catch((error: FirebaseError) => {
      failNotify(error.message);
      setLoading(false);
      setModalOpen(false);
    });
  };
  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg shadow w-3/5 p-6 overflow-hidden">
      <div
        className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <p className="text-center text-2xl font-bold">
          Saatnya menghapus data bulan:{' '}
          {new Date(toBeDeletedMonth).toLocaleString('id-ID', {
            month: 'long',
          })}
        </p>
      </div>
      <div className="flex flex-row-reverse justify-start mt-3">
        <div className="w-[fit-content] gap-2 flex flex-row-reverse relative">
          {loading && (
            <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-sm z-50 bg-opacity-50">
              <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-2xl" />
            </div>
          )}
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            onClick={(e) => {
              handleDeleteData();
            }}
          >
            Konfirm
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            Sudah
          </button>
        </div>
      </div>
    </div>
  );
};
