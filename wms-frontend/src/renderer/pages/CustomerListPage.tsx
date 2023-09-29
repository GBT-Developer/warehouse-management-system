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
                {customerList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={3}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  customerList
                    .filter((customer) => {
                      if (search === '') return customer;
                      else if (
                        customer.name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        customer.address
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        customer.phone_number
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return customer;
                    })
                    .sort((a, b) => {
                      return a.name.localeCompare(b.name);
                    })
                    .map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                        onClick={() => {
                          if (!customer.id) return;
                          navigate('/customer-list/' + customer.id);
                        }}
                      >
                        <SingleTableItem>{customer.name}</SingleTableItem>
                        <SingleTableItem>{customer.address}</SingleTableItem>
                        <SingleTableItem>
                          {customer.phone_number}
                        </SingleTableItem>
                        <SingleTableItem>
                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLoading(true);
                              if (!customer.id) return;
                              const purchaseRef = doc(
                                db,
                                'customer',
                                customer.id
                              );
                              deleteDoc(purchaseRef).catch((error) =>
                                console.log(error)
                              );
                              customerList.splice(index, 1);
                              setLoading(false);
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </SingleTableItem>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <div className=" absolute bottom-[2.5rem] right-[2.5rem]">
            <button
              type="submit"
              className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md  sh"
              onClick={() => navigate('/customer-list/new')}
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
