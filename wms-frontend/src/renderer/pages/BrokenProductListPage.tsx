import { collection, getDocs, query } from '@firebase/firestore';
import { db } from 'firebase';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export const BrokenProductListPage = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(collection(db, 'broken_product'));
        setLoading(true);
        const querySnapshot = await getDocs(productsQuery);

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
        });

        setProducts(productData);
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
              Broken Products
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
                <th className=" py-3">Name</th>
                <th className=" py-3">Amount</th>
              </TableHeader>
              <tbody>
                {products
                  .filter((product) => {
                    if (search === '') return product;
                    else if (
                      product.brand
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      product.motor_type
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      product.part
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      product.available_color
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                      return product;
                  })
                  .map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:shadow-md cursor-pointer hover:underline"
                    >
                      <SingleTableItem>
                        {product.brand +
                          ' ' +
                          product.motor_type +
                          ' ' +
                          product.part +
                          ' ' +
                          product.available_color}
                      </SingleTableItem>
                      <SingleTableItem>{product.count}</SingleTableItem>
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
