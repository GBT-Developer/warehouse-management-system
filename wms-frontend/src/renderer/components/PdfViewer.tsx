import { PDFViewer } from '@react-pdf/renderer';
import { useAuth } from 'renderer/providers/AuthProvider';
import { Product } from '../interfaces/Product';
import DispatchNote from './reports/DispatchNote';
import Invoice from './reports/Invoice';

export const PdfViewer = ({
  invoice,
  dispatchNote,
  destinationName,
  modalOpen,
  products,
  setModalOpen,
  setInvoice,
  setDipatchNote,
}: {
  invoice: Invoice | null;
  dispatchNote: DispatchNote | null;
  products: Product[];
  destinationName: string;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice | null>>;
  setDipatchNote: React.Dispatch<React.SetStateAction<DispatchNote | null>>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { companyInfo } = useAuth();

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        modalOpen ? 'block' : 'hidden'
      } w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 flex justify-center items-center backdrop-filter backdrop-blur-sm`}
      onClick={() => {
        setModalOpen(false);
        setInvoice(null);
        setDipatchNote(null);
      }}
    >
      <PDFViewer className="w-3/5 h-[90%] rounded-lg">
        {invoice ? (
          <Invoice
            invoice={invoice}
            companyInfo={companyInfo}
            destinationName={destinationName}
          />
        ) : (
          <DispatchNote
            products={products}
            invoice={dispatchNote}
            companyInfo={companyInfo}
            destinationName={destinationName}
          />
        )}
      </PDFViewer>
    </div>
  );
};
