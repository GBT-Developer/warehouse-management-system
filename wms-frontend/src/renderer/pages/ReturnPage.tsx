import { db } from 'firebase';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useParams } from 'react-router-dom';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Customer } from 'renderer/interfaces/Customer';
import { Invoice } from 'renderer/interfaces/Invoice';
import { Retoure } from 'renderer/interfaces/Retoure';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function ReturnPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [editToggle, setEditToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<Supplier>();
  const statusOptionRef = useRef<HTMLSelectElement>(null);
  const [newRetoure, setNewRetoure] = useState<Retoure>();
  const productOptionRef = useRef<HTMLSelectElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        //take invoice from firestore
        const invoicesQuery = query(collection(db, 'invoice'));
        const querySnapshot = await getDocs(invoicesQuery);

        const invoiceData: Invoice[] = [];
        querySnapshot.forEach((theInvoice) => {
          const data = theInvoice.data() as Invoice;
          data.id = theInvoice.id;
          invoiceData.push(data);
        });

        setInvoices(invoiceData);
        //take customer from firestore
        invoices.forEach(async (invoice) => {
          if (!invoice.customer_id) return;
          const customersQuery = query(collection(db, 'customer'));
          const customersSnapshot = await getDocs(customersQuery);

          const customerData: Customer[] = [];
          customersSnapshot.forEach((theCustomer) => {
            const data = theCustomer.data() as Customer;
            data.id = theCustomer.id;
            customerData.push(data);
          });
          setCustomers(customerData);
          if (customers) {
            invoices.forEach((invoice) => {
              const filteredCustomers = customers.filter(
                (customer) => customer.id === invoice.customer_id
              );
              setFilteredCustomers(filteredCustomers);
            });
          } else {
            // Handle the case where 'customers' is undefined.
            console.error('Customers are undefined.');
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);
  console.log(invoices);
  console.log(filteredCustomers);

  function handleSubmit(e: { preventDefault: () => void }) {
    //input newRetoure to the database
    e.preventDefault();
    if (!newRetoure?.product_name || !newRetoure?.count) {
      setErrorMessage('Please fill all the fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (
      Number.isNaN(Number(newRetoure.count)) ||
      Number(newRetoure.count) <= 0
    ) {
      setErrorMessage('Please input a valid number');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    setLoading(true);
    const newRetoureRef = collection(db, 'broken_products');
    addDoc(newRetoureRef, newRetoure)
      .then(() => {
        console.log('Document successfully written!');
        setLoading(false);
        setNewRetoure(undefined);
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
        setLoading(false);
      });
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Retoure Page
      </h1>
      <form
        onSubmit={handleSubmit}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div></div>
        <button
          type="button"
          className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red-500"
          onClick={() => setModalOpen(true)}
        >
          Choose Invoice
        </button>
        <InputField
          loading={loading}
          label="Product"
          labelFor="product_name"
          value={newRetoure?.product_name ?? ''}
          placeholder="i.e. Yamaha Aerox "
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, product_name: e.target.value });
          }}
        />

        <InputField
          label="Count"
          labelFor="count"
          value={newRetoure?.count ?? ''}
          placeholder="i.e. 2"
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, count: e.target.value });
          }}
        />
        <AreaField
          label="Remarks"
          labelFor="remarks"
          maxLength={300}
          rows={7}
          value={newRetoure?.remarks ?? ''}
          placeholder="Additional info... (max. 300 characters)"
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, remarks: e.target.value });
          }}
        />
        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'warehouse'} className="text-md">
                Status
              </label>
            </div>
            <div className="w-2/3">
              <select
                defaultValue={''}
                ref={statusOptionRef}
                disabled={loading}
                id="status"
                name="status"
                onChange={(e) => {
                  setNewRetoure({
                    ...newRetoure,
                    status: e.target.value,
                  });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value={''} disabled>
                  Choose Status
                </option>
                <option value="Return">Return</option>
                <option value="Exchanged">Exchanged</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Retoure date
            </label>
          </div>
          <div className="w-2/3">
            <input
              disabled={loading}
              type="date"
              name="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => {
                setNewRetoure(() => ({
                  ...newRetoure,
                  created_at: e.target.value,
                }));
              }}
            />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Submit
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
      <TableModal
        placeholder="Search by product brand"
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        //handleSearch={handleSearch}
        title={'Choose Product'}
        headerList={
          invoices.length > 0 ? ['', 'Invoice Number', 'Customer Name'] : []
        }
      >
        {invoices.length > 0 ? (
          invoices.map((invoice, index) => (
            <tr
              key={index}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (
                  selectedInvoice &&
                  selectedInvoice.find((i) => i === invoice)
                ) {
                  console.log('found');
                  setSelectedInvoice(
                    selectedInvoice?.filter((i) => i !== invoice)
                  );
                  setNewRetoure({
                    ...newRetoure,
                    invoice: invoice.items.filter(
                      (i) => i.invoice.id !== invoice.id
                    ),
                  });
                } else {
                  console.log('not found');
                  if (!invoice.id) return;
                  console.log(invoice);
                }
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={selectedInvoice?.includes(invoice)}
                  readOnly
                />
              </SingleTableItem>
              <SingleTableItem key={index}>{invoice.id}</SingleTableItem>
              <SingleTableItem>{invoice.customer_id}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No Invoice found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
}
