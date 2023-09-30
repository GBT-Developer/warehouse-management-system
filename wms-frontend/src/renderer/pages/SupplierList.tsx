import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function SupplierList() {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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
              Supplier List
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
                <th className=" py-3">Factory Name</th>
                <th className=" py-3">Address</th>
                <th className=" py-3">Telephone</th>
                <th className=" py-3">Bank Account</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {supplierList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={4}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
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
                        <SingleTableItem>
                          {supplier.address}, {supplier.city}
                        </SingleTableItem>
                        <SingleTableItem>
                          <span className="font-medium text-md">
                            {supplier.phone_number}
                            <br />
                            <span className="text-sm font-normal">
                              {'a.n.' + supplier.contact_person}
                            </span>
                          </span>
                        </SingleTableItem>
                        <SingleTableItem>
                          <span className="font-medium text-md">
                            {supplier.bank_number}
                            <br />
                            <span className="text-sm font-normal">
                              {'a.n.' + supplier.bank_owner}
                            </span>
                          </span>
                        </SingleTableItem>
                        <SingleTableItem>
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
                            Purchase History
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
              className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md"
              onClick={() => navigate('/supplier-list/new')}
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
