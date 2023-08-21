import { db } from 'firebase';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const ManageStockPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const [updatedProduct, setUpdatedProduct] = useState('');

  // take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'product'));
        const querySnapshot = await getDocs(q);

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
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

  const handleTotalChange = (index: number, value: string) => {
    // Update the total value for the specific row
    const updatedTotalValues = [...total];
    updatedTotalValues[index] = value;
    setTotal(updatedTotalValues);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index); // Set the editing index to enable editing for this row
  };

  const handleBlur = () => {
    setEditingIndex(-1); // Reset the editing index when blurred
  };

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    //declare the index
    let index = 0;
    // Check for invalid values in the total array
    total.forEach((value) => {
      if (Number.isNaN(Number(value))) {
        setErrorMessage('jumlah barang tidak valid');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      }
    });
    // Update the data in Firebase
    products.forEach((product) => {
      if (product.id === updatedProduct)
        index = products.findIndex((product) => product.id === updatedProduct);
    });
    const collectionRef = collection(db, 'product');
    const docRef = doc(collectionRef, updatedProduct);
    updateDoc(docRef, { count: total[index] })
      .then(() => {
        console.log(`Document ${updatedProduct} successfully updated!`);
      })
      .catch((error) => {
        console.error(`Error updating document ${updatedProduct}:`, error);
      });

    setEditingIndex(-1);
    inputRef.current?.blur();
  }

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch} />
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <TableHeader>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Merk</th>
                <th className="px-4 py-3">Part</th>
                <td className="px-4 py-3">Jumlah</td>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {products.map((product: Product, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <SingleTableItem>{index + 1}</SingleTableItem>
                    <SingleTableItem>{`${product.brand}`}</SingleTableItem>
                    <SingleTableItem>{`${product.part}`}</SingleTableItem>
                    <SingleTableItem>
                      <form
                        className="flex justify-start gap-[1rem]"
                        onSubmit={(e) => handleSubmit(e)}
                      >
                        <input
                          ref={inputRef}
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
                          onClick={() => {
                            handleEditClick(index);
                            if (product.id) setUpdatedProduct(product.id);
                          }}
                        >
                          <AiFillEdit />
                        </button>
                      </form>
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
            </table>
            {errorMessage && (
              <p className="text-red-500 text-sm ">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
