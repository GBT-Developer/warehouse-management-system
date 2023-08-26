import { db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiFillEdit, AiFillInfoCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function SupplierList() {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [telephone, setTelephone] = useState<string[]>([]);
  const [updatedProduct, setUpdatedProduct] = useState('');
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // Take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'supplier'));
        const querySnapshot = await getDocs(q);

        const supplierData: Supplier[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Supplier;
          data.id = theProduct.id;
          supplierData.push(data);
        });

        setSupplierList(supplierData);
        setTelephone(supplierData.map((supplier) => supplier.phone_number));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  const handleEditClick = (index: number) => {
    setEditingIndex(index); // Set the editing index to enable editing for this row
  };

  const handleBlur = () => {
    setEditingIndex(-1); // Reset the editing index when blurred
  };
  const handleTelephoneChange = (index: number, value: string) => {
    // Update the total value for the specific row
    const updatedTelephoneValues = [...telephone];
    updatedTelephoneValues[index] = value;
    setTelephone(updatedTelephoneValues);
  };

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // Declare the index
    const index = 0;

    setEditingIndex(-1);
    inputRef.current?.blur();
  }
  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            List Supplier
          </h1>
          <TableTitle setSearch={setSearch}></TableTitle>
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className="px-4 py-3">Factory Name</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Bank Account</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto"></tbody>
              {supplierList.map((supplier: Supplier, index) => (
                <tr key={index} className="border-b">
                  <SingleTableItem>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {supplier.company_name}
                    </span>
                    <br />
                    <span style={{ fontSize: '12px', fontWeight: 'lighter' }}>
                      {supplier.address}, {supplier.city}
                    </span>
                  </SingleTableItem>
                  <SingleTableItem>
                    <form
                      className="flex justify-start gap-[1rem]"
                      onSubmit={(e) => handleSubmit(e)}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        className="w-30 text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                        value={telephone[index]}
                        onChange={(e) =>
                          handleTelephoneChange(index, e.target.value)
                        }
                        disabled={editingIndex !== index}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="text-gray-500 p-2 hover:text-gray-700 cursor-pointer bg-gray-100 rounded-md"
                        onClick={() => {
                          handleEditClick(index);
                          if (supplier.id) setUpdatedProduct(supplier.id);
                        }}
                      >
                        <AiFillEdit />
                      </button>
                    </form>
                  </SingleTableItem>
                  <SingleTableItem>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {supplier.bank_number}
                    </span>
                    <br />
                    <span style={{ fontSize: '12px', fontWeight: 'lighter' }}>
                      {'a.n'} {supplier.bank_owner}
                    </span>
                  </SingleTableItem>
                  <SingleTableItem>
                    <button
                      type="button"
                      className="text-gray-500 p-2 hover:text-gray-700 cursor-pointer bg-gray-100 rounded-md"
                      onClick={() => {
                        navigate('/transactionhistory');
                      }}
                    >
                      Riwayat Pembelian
                    </button>
                  </SingleTableItem>
                  <SingleTableItem>
                    <AiFillInfoCircle size={20} className="cursor-pointer" />
                  </SingleTableItem>
                </tr>
              ))}
            </table>
          </div>
          <div className="flex flex-row-reverse gap-2 w-full justify-start">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:-translate-y-1 "
              style={{
                width: '100px', // Adjust the width as needed
                height: '40px', // Adjust the height as needed
              }}
              onClick={() => navigate('/inputsupplier')}
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
