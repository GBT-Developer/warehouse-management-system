import { AiFillEdit } from 'react-icons/ai';
import { BsChevronLeft, BsChevronRight, BsSearch } from 'react-icons/bs';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useState } from 'react';

export const ManageStockPage = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState('100');

  return (
    <PageLayout>
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
        Penyesuaian Stock
      </h1>
      <section className="bg-gray-50 w-full h-full px-3 bg-transparent overflow-hidden">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full flex justify-center">
              <form className="flex items-center md:w-1/2">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <BsSearch />
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Cari nama produk"
                    required
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Nama Produk
                  </th>
                  <th
                    scope="col"
                    className="py-3 pl-4 pr-[4rem] flex justify-end"
                  >
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto">
                <tr className="border-b dark:border-gray-700">
                  <th
                    scope="row"
                    className="px-4 py-3 flex-1 font-medium text-gray-900 dark:text-white max-w-xs"
                  >
                    Knalpot Honda Beat
                  </th>
                  <td className="px-4 py-3 flex-1 max-w-xs">
                    <div className="flex items-center gap-6 justify-end">
                      <input
                        type="text"
                        className="w-20 text-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary-500 focus:ring-primary-500"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        disabled={loading}
                        onBlur={() => setLoading(true)}
                      />
                      <button
                        className="text-gray-500 dark:text-gray-400 p-2 hover:text-gray-700 dark:hover:text-white cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-md"
                        onClick={() => setLoading(false)}
                      >
                        <AiFillEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
            <div className="flex gap-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing
              <p className="font-semibold text-gray-900 dark:text-white">1-1</p>
              of
              <p className="font-semibold text-gray-900 dark:text-white">1</p>
            </div>
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="/"
                  className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <BsChevronLeft />
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  1
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  2
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <BsChevronRight />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </PageLayout>
  );
};
