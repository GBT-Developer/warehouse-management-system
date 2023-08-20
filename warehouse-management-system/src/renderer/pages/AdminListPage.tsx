import { functions } from 'firebase';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { CustomUser } from 'renderer/interfaces/CustomUser';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const AdminListPage = () => {
  const [search, setSearch] = useState('');
  const [adminList, setAdminList] = useState<CustomUser[]>([]);
  const [filteredAdminList, setFilteredAdminList] =
    useState<CustomUser[]>(adminList);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDelete = (uid: string) => {
    httpsCallable(
      functions,
      'deleteUser'
    )({ uid })
      .then(() => {
        setAdminList(adminList.filter((admin) => admin.uid !== uid));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    httpsCallable(functions, 'getUsers')()
      .then((result) => {
        setAdminList(result.data as CustomUser[]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (search === '') {
      setFilteredAdminList(adminList);
    } else {
      setFilteredAdminList(
        adminList.filter((admin) =>
          admin.displayName?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, adminList]);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            {user?.owner && (
              <button
                type="button"
                className="px-4 py-2 font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
                onClick={() => navigate('/createadminpage')}
              >
                Create User
              </button>
            )}
          </TableTitle>
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <TableHeader>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Aksi</th>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {filteredAdminList.map((admin, index) => (
                  <tr key={admin.uid} className="border-b dark:border-gray-700">
                    <SingleTableItem>{index + 1}</SingleTableItem>
                    <SingleTableItem>{admin.displayName}</SingleTableItem>
                    <SingleTableItem>{admin.email}</SingleTableItem>
                    <SingleTableItem>
                      <button
                        type="button"
                        className={`px-2 py-1 text-xs text-white rounded-md
                        ${
                          admin.uid === user?.uid
                            ? 'bg-gray-700'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        onClick={() =>
                          admin.uid !== user?.uid && handleDelete(admin.uid)
                        }
                      >
                        {admin.uid === user?.uid ? "It's you! " : 'Delete'}
                      </button>
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
