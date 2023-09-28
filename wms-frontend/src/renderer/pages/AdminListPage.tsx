import { db, functions } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { CustomUser } from 'renderer/interfaces/CustomUser';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const AdminListPage = () => {
  const [search, setSearch] = useState('');
  const [adminList, setAdminList] = useState<CustomUser[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = (uid: string) => {
    httpsCallable(
      functions,
      'deleteUser'
    )({ uid })
      .then(() => {
        setAdminList(adminList.filter((admin) => admin.id !== uid));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    const fetchUser = async () => {
      // Fetch all user in the collection user
      const userRef = collection(db, 'user');
      const q = query(userRef);
      const userSnapshot = await getDocs(q);

      const userData: CustomUser[] = [];
      userSnapshot.forEach((theUser) => {
        const data = theUser.data() as CustomUser;
        data.id = theUser.id;
        userData.push(data);
      });

      setAdminList(userData);
    };

    setLoading(true);

    fetchUser().catch((error) => {
      console.log(error);
    });

    setLoading(false);
  }, []);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Admin List
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <div className="overflow-y-auto h-full">
              <table className="w-full text-sm text-left text-gray-500">
                <TableHeader>
                  <th className="py-3">Nama</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3"></th>
                </TableHeader>
                <tbody>
                  {adminList
                    .filter((admin) => {
                      if (search === '') return admin;
                      else if (
                        admin.display_name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        admin.email.toLowerCase().includes(search.toLowerCase())
                      )
                        return admin;
                    })
                    .sort((a, b) => {
                      if (a.display_name < b.display_name) return -1;
                      if (a.display_name > b.display_name) return 1;
                      return 0;
                    })
                    .map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                      >
                        <SingleTableItem>{admin.display_name}</SingleTableItem>
                        <SingleTableItem>{admin.email}</SingleTableItem>
                        <SingleTableItem>{admin.role}</SingleTableItem>
                        {user?.id !== admin.id && (
                          <SingleTableItem>
                            <button
                              type="button"
                              className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (admin.id) handleDelete(admin.id);
                              }}
                            >
                              <BiSolidTrash />
                            </button>
                          </SingleTableItem>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
