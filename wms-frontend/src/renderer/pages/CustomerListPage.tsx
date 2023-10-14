import {
  QueryStartAtConstraint,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Customer } from 'renderer/interfaces/Customer';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function CustomerListPage() {
  const [customerList, setCustomerList] = useState<Customer[]>([]); // [1
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );
  const successNotify = () =>
    toast.success('Customer berhasil dihapus', {
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
    toast.error(e ?? 'Customer gagal dihapus', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'customer'),
          orderBy('name', 'asc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setNextPostsEmpty(true);
          setNextPostsLoading(false);
          setCustomerList([]);
          setLoading(false);
          return;
        }

        const customerData: Customer[] = [];
        querySnapshot.forEach((theCustomer) => {
          const data = theCustomer.data() as Customer;
          data.id = theCustomer.id;
          customerData.push(data);
        });

        const nextQ = startAfter(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
        setNextQuery(nextQ);

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

  const fetchNextPosts = async () => {
    if (nextQuery === null) {
      setNextPostsEmpty(true);
      setNextPostsLoading(false);
      return;
    }

    setNextPostsLoading(true);
    try {
      const q = query(
        collection(db, 'customer'),
        orderBy('name', 'asc'),
        limit(50),
        nextQuery
      );
      const querySnapshot = await getDocs(q);

      const customerData: Customer[] = [];
      querySnapshot.forEach((theCustomer) => {
        const data = theCustomer.data() as Customer;
        data.id = theCustomer.id;
        customerData.push(data);
      });

      const nextQ = startAfter(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );
      setNextQuery(nextQ);

      setCustomerList([...customerList, ...customerData]);
      setNextPostsLoading(false);
      if (querySnapshot.docs.length === 0) setNextPostsEmpty(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              List Customer
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Nama</th>
                <th className=" py-3">Alamat</th>
                <th className=" py-3">Telepon</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {customerList.length > 0 &&
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
                              setLoading(true);
                              deleteDoc(purchaseRef)
                                .then(() => {
                                  const newCustomerList = customerList.filter(
                                    (item) => item.id !== customer.id
                                  );
                                  setCustomerList(newCustomerList);
                                  successNotify();
                                  setLoading(false);
                                  setCustomerList((prev) =>
                                    prev.filter(
                                      (item) => item.id !== customer.id
                                    )
                                  );
                                })
                                .catch(() => {
                                  failNotify('Customer gagal dihapus');
                                  setLoading(false);
                                });
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </SingleTableItem>
                      </tr>
                    ))}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <p className="text-gray-500 text-sm">Data tidak tersedia</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={fetchNextPosts}
                  disabled={nextPosts_loading}
                >
                  {nextPosts_loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                  ) : (
                    'Selanjutnya'
                  )}
                </button>
              </div>
            )}
          </div>
          <div className=" absolute bottom-[2.5rem] right-[2.5rem]">
            <button
              type="submit"
              className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md  sh"
              onClick={() => navigate('/customer-list/new')}
            >
              + Tambah
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
