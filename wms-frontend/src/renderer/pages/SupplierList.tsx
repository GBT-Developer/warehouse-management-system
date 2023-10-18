import {
  QueryStartAtConstraint,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function SupplierList() {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );
  const { user } = useAuth();

  // Take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'supplier'),
          orderBy('company_name', 'asc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setNextPostsEmpty(true);
          setNextPostsLoading(false);
          return;
        }

        const supplierData: Supplier[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Supplier;
          data.id = theProduct.id;
          supplierData.push(data);
        });

        const nextQ = startAfter(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
        setNextQuery(nextQ);

        setSupplierList(supplierData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  // Take next product from firebase
  const fetchMoreData = async () => {
    if (nextQuery === null) {
      setNextPostsEmpty(true);
      setNextPostsLoading(false);
      return;
    }
    setNextPostsLoading(true);
    try {
      const q = query(
        collection(db, 'supplier'),
        orderBy('company_name', 'asc'),
        limit(50),
        nextQuery
      );
      const querySnapshot = await getDocs(q);

      const supplierData: Supplier[] = [];
      querySnapshot.forEach((theProduct) => {
        const data = theProduct.data() as Supplier;
        data.id = theProduct.id;
        supplierData.push(data);
      });

      const nextQ = startAfter(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );
      setNextQuery(nextQ);

      setSupplierList([...supplierList, ...supplierData]);
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
              List Supplier
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
                <th className=" py-3">Nama Perusahaan</th>
                {user?.role.toLowerCase() === 'owner' && (
                  <>
                    <th className=" py-3">Alamat</th>
                    <th className=" py-3">Telefon</th>
                    <th className=" py-3">Bank</th>
                  </>
                )}
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {supplierList.length > 0 &&
                  supplierList
                    .filter((supplier) => {
                      if (search === '') return supplier;
                      else if (
                        supplier.company_name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return supplier;
                      else if (
                        supplier.address
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return supplier;
                    })
                    .sort((a, b) => a.address.localeCompare(b.address))
                    .sort((a, b) =>
                      a.company_name.localeCompare(b.company_name)
                    )
                    .map((supplier: Supplier, index) => (
                      <tr
                        key={index}
                        className="border-b hover:shadow-md cursor-pointer"
                        onClick={() =>
                          supplier.id &&
                          navigate('/supplier-list/detail/' + supplier.id)
                        }
                      >
                        <SingleTableItem>
                          {supplier.company_name}{' '}
                        </SingleTableItem>
                        {user?.role.toLowerCase() === 'owner' && (
                          <>
                            <SingleTableItem>
                              {supplier.address}, {supplier.city}
                            </SingleTableItem>
                            <SingleTableItem>
                              <span className="font-medium text-md">
                                {supplier.phone_number}
                                <br />
                                <span className="text-sm font-normal text-gray-500">
                                  {'a.n. ' + supplier.contact_person}
                                </span>
                              </span>
                            </SingleTableItem>
                            <SingleTableItem>
                              <span className="font-medium text-md">
                                {supplier.bank_number}
                                <br />
                                <span className="text-sm font-normal text-gray-500">
                                  {'a.n. ' + supplier.bank_owner}
                                </span>
                              </span>
                            </SingleTableItem>
                          </>
                        )}
                        <SingleTableItem>
                          <div className="w-full flex justify-end pr-5">
                            <button
                              type="button"
                              className="text-gray-500 p-2 hover:text-gray-700 cursor-pointer bg-gray-100 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                supplier.id &&
                                  navigate(
                                    '/supplier-list/report/' + supplier.id
                                  );
                              }}
                            >
                              Riwayat Pembelian
                            </button>
                          </div>
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
                  onClick={fetchMoreData}
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
          {user?.role.toLowerCase() === 'owner' && (
            <div className=" absolute bottom-[2.5rem] right-[2.5rem]">
              <button
                type="submit"
                className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md"
                onClick={() => navigate('/supplier-list/new')}
              >
                + Tambah
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
