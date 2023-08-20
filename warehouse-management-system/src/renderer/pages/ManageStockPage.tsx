import { db } from 'firebase';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { BsChevronLeft, BsChevronRight, BsSearch } from 'react-icons/bs';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export const ManageStockPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'product'));
        const querySnapshot = await getDocs(q);

        const productData: Product[] = [];
        querySnapshot.forEach((doc) => {
          productData.push(doc.data() as Product);
        });

        setProducts(productData);
        setTotal(productData.map((product) => product.count));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  console.log(products);

  const handleTotalChange = (index: number, value: string) => {
    // Update the total value for the specific row
    const updatedTotalValues = [...total];
    updatedTotalValues[index] = value;
    setTotal(updatedTotalValues);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index); // Set the editing index to enable editing for this row
  };

  const handleBlur = () => {
    setEditingIndex(null); // Reset the editing index when blurred
  };

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // Check for invalid values in the total array
    total.forEach((value) => {
      if (Number.isNaN(Number(value))) {
        setErrorMessage('jumlah barang tidak valid');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }
    });
    // Update the data in Firebase
    products.forEach((product, index) => {
      const collectionRef = collection(db, 'product');
      const docRef = doc(collectionRef, product.id);

      updateDoc(docRef, { count: total[index] })
        .then(() => {
          console.log(`Document ${product.id} successfully updated!`);
        })
        .catch((error) => {
          console.error(`Error updating document ${product.id}:`, error);
        });
    });
  }

  return (
    <PageLayout>
      <section className="bg-gray-50 w-full h-full px-3 bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2 flex items-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <BsSearch />
                </div>
                <input
                  type="text"
                  id="simple-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Cari nama produk"
                  required
                />
              </div>
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
                {products.map((product: Product, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <th
                      scope="row"
                      className="px-4 py-3 flex-1 font-medium text-gray-900 dark:text-white max-w-xs"
                    >
                      {`${product.part} ${product.brand}`}
                    </th>
                    <td className="px-4 py-3 flex-1 max-w-xs">
                      <div className="flex items-center gap-6 justify-end">
                        <input
                          type="text"
                          className="w-20 text-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary-500 focus:ring-primary-500"
                          value={total[index]}
                          onChange={(e) =>
                            handleTotalChange(index, e.target.value)
                          }
                          disabled={editingIndex !== index}
                          onBlur={handleBlur}
                        />
                        <button
                          type="button"
                          className="text-gray-500 dark:text-gray-400 p-2 hover:text-gray-700 dark:hover:text-white cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-md"
                          onClick={() => handleEditClick(index)}
                        >
                          <AiFillEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            {errorMessage && (
              <p className="text-red-500 text-sm ">{errorMessage}</p>
            )}
          </nav>
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      </section>
    </PageLayout>
  );
};
