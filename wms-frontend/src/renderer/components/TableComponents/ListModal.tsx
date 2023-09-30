import { collection, getDocs, query } from '@firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { SingleTableItem } from './SingleTableItem';
import { TableHeader } from './TableHeader';
import { TableTitle } from './TableTitle';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSelectionConfirmed: (selectedProducts: string[]) => void;
}

const ListModal = ({
  children,
  isOpen,
  onClose,
  onSelectionConfirmed,
}: ModalProps) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.id === 'modal') onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(collection(db, 'product'));
        setLoading(true);
        const querySnapshot = await getDocs(productsQuery);

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
        });

        setProducts(productData);
        setFilteredProducts(productData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.brand
          .concat(
            ' ',
            product.motor_type,
            ' ',
            product.part,
            ' ',
            product.available_color
          )
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  const handleCheckboxChange = (productId: string | undefined) => {
    if (productId) {
      if (selectedProducts.includes(productId)) {
        setSelectedProducts(selectedProducts.filter((id) => id !== productId));
      } else {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
      id="wrapper"
      onClick={handleClose}
    >
      <div className="w-5/6 flex flex-col">
        <button
          type="button"
          className="text-white text-xl place-self-end"
          onClick={() => onClose()}
        >
          X
        </button>

        <div className="bg-white p-2 rounded">
          <div className="w-full h-full bg-transparent overflow-hidden">
            <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
              <TableTitle setSearch={setSearch}>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                  Select Products
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
                    <th className=" py-3"></th>
                    <th className=" py-3">Name</th>
                    <th className=" py-3">Selling Price</th>
                    <th className=" py-3">Warehouse</th>
                    <th className=" py-3"></th>
                  </TableHeader>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                        onClick={() => handleCheckboxChange(product.id)}
                      >
                        <SingleTableItem>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(
                              product.id || ''
                            )}
                          />
                        </SingleTableItem>
                        <SingleTableItem>
                          {product.brand +
                            ' ' +
                            product.motor_type +
                            ' ' +
                            product.part +
                            ' ' +
                            product.available_color}
                        </SingleTableItem>
                        <SingleTableItem>{product.sell_price}</SingleTableItem>
                        <SingleTableItem>
                          {product.warehouse_position}
                        </SingleTableItem>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-row-reverse gap-2 w-full justify-start">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    // Handle the selected products as needed
                    onSelectionConfirmed(selectedProducts);
                    onClose();
                  }}
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListModal;
