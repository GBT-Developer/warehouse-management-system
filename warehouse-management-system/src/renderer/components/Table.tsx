import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useAuth } from 'renderer/providers/AuthProvider';
import { httpsCallable } from 'firebase/functions';
import { functions } from 'firebase';
import { SearchBar } from './SearchBar';
import { TableHeader } from './TableHeader';

const Datatable: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    httpsCallable(functions, 'getUsers')()
      .then((res) => {
        setUserData(res.data as User[]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDelete = async (id: string) => {
    const res = await httpsCallable(
      functions,
      'deleteUser'
    )({
      uid: id,
    });

    if (res.data) {
      setUserData(userData.filter((item) => item.uid !== id));
    }
  };

  return (
    <section className="bg-gray-50 w-full h-full px-3 bg-transparent overflow-hidden">
      <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          {user?.owner && (
            <Link
              to="/createadminpage"
              className="px-4 py-2 font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
            >
              Create User
            </Link>
          )}
          <SearchBar handleSearch={handleSearch} />
          <TableHeader />
        </div>
        <div className="overflow-y-auto h-full">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">
                  UID
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                {user?.owner && (
                  <th scope="col" className="px-4 py-3 flex justify-end">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {userData.map((item) => {
                if (
                  item.email?.toLocaleLowerCase().includes(search) ||
                  search.trim() === ''
                ) {
                  return (
                    <tr
                      key={item.uid}
                      className="border-b dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-4 py-2 flex-1 font-medium text-gray-900 dark:text-white max-w-xs"
                      >
                        {item.uid}
                      </th>
                      <th
                        scope="row"
                        className="px-4 py-2 flex-1 font-medium text-gray-900 dark:text-white max-w-xs"
                      >
                        <p className="w-full">{item.email}</p>
                      </th>
                      {user?.owner && (
                        <th
                          scope="row"
                          className="px-4 py-2 flex-1 font-medium text-gray-900 dark:text-white max-w-xs flex justify-end"
                        >
                          <button
                            type="button"
                            className={`px-4 py-2 font-medium max-w-xs text-gray-900 dark:text-white
                          ${
                            user?.uid === item.uid
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-red-900 hover:bg-red-800'
                          }
                          rounded-lg`}
                            onClick={() =>
                              user?.uid !== item.uid && handleDelete(item.uid)
                            }
                          >
                            {user?.uid === item.uid ? "It's you!" : 'Delete'}
                          </button>
                        </th>
                      )}
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Datatable;
