import { db } from 'firebase';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Customer } from 'renderer/interfaces/Customer';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function CustomerListPage() {
  const [customerList, setCustomerList] = useState<Customer[]>([]); // [1
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'customer'));
        const querySnapshot = await getDocs(q);

        const customerData: Customer[] = [];
        querySnapshot.forEach((theCustomer) => {
          const data = theCustomer.data() as Customer;
          data.id = theCustomer.id;
          customerData.push(data);
        });

        setCustomerList(customerData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Customer List
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Name</th>
                <th className=" py-3">Address</th>
                <th className=" py-3">Telephone</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {customerList.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="border-b hover:shadow-md cursor-pointer hover:underline"
                    onClick={() => navigate('/edit-customer/' + customer.id)}
                  >
                    <SingleTableItem>{customer.name}</SingleTableItem>
                    <SingleTableItem>{customer.address}</SingleTableItem>
                    <SingleTableItem>{customer.phone_number}</SingleTableItem>
                    <SingleTableItem>
                      <button
                        type="button"
                        className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setLoading(true);
                          if (!customer.id) return;
                          const purchaseRef = doc(db, 'customer', customer.id);
                          await deleteDoc(purchaseRef);
                          customerList.splice(index, 1);
                          setLoading(false);
                        }}
                      >
                        <BiSolidTrash />
                      </button>
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
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
              onClick={() => navigate('/input-customer')}
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
