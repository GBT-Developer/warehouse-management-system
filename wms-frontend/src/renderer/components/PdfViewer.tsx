import { PDFViewer } from '@react-pdf/renderer';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { useAuth } from 'renderer/providers/AuthProvider';
import Invoice from './reports/Invoice';

export interface InvoiceProps {
  invoice: Invoice;
  companyInfo: CompanyInfo | null;
  destinationName: string;
}

export const PdfViewer = ({
  invoice,
  destinationName,
  modalOpen,
  setModalOpen,
  setInvoice,
}: InvoiceProps & {
  setInvoice: React.Dispatch<React.SetStateAction<Invoice | null>>;
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
      }}
    >
      <PDFViewer className="w-3/5 h-[90%] rounded-lg">
        <Invoice
          invoice={invoice}
          companyInfo={companyInfo}
          destinationName={destinationName}
        />
      </PDFViewer>
    </div>
  );
};
