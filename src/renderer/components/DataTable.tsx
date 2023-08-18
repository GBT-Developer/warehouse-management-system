import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { User } from 'firebase/auth';
import { functions } from '../../firebase';
import { SearchBar } from './SearchBar';
import { TableHeader } from './TableHeader';

const Datatable: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    httpsCallable(functions, 'getAllUsersCallable')()
      .then((result) => {
        setData(result.data as User[]);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDelete = async (id: string) => {
    try {
      httpsCallable(
        functions,
        'deleteUserCallable'
      )({
        uid: id,
      })
        .then(() => {
          setData(data.filter((item) => item.uid !== id));
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  return (
    <section className="bg-gray-50 w-full h-full px-3 bg-transparent overflow-hidden">
      <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          <Link
            to="/createadminpage"
            className="px-4 py-2 font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
          >
            Create User
          </Link>
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
                <th scope="col" className="px-4 py-3 flex justify-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {data.map((item) => {
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
                      <th
                        scope="row"
                        className="px-4 py-2 flex-1 font-medium text-gray-900 dark:text-white max-w-xs flex justify-end"
                      >
                        <button
                          type="button"
                          className="px-4 py-2 font-medium text-gray-900 dark:text-white max-w-xs bg-red-900 hover:bg-red-800 rounded-lg"
                          onClick={() => handleDelete(item.uid)}
                        >
                          Delete
                        </button>
                      </th>
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
