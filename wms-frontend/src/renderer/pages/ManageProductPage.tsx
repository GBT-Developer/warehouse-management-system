import { collection, getDocs, query } from '@firebase/firestore';
import { db } from 'firebase';
import { where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoInformationCircleSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const ManageProductPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(
          collection(db, 'product'),
          warehousePosition !== 'Both'
            ? where('warehouse_position', '==', warehousePosition)
            : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi'])
        );
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
  }, [warehousePosition]);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Kelola Product
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
                <th className=" py-3">Nama Product</th>
                <th className=" py-3">Jumlah</th>
                <th className=" py-3">Harga Jual</th>
                <th className=" py-3">Posisi Gudang</th>
                <th className=" py-3"></th>
              </TableHeader>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={4}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  products
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
                    .sort((a, b) => {
                      return a.available_color.localeCompare(b.available_color);
                    })
                    .sort((a, b) => {
                      return a.part.localeCompare(b.part);
                    })
                    .sort((a, b) => {
                      return a.motor_type.localeCompare(b.motor_type);
                    })
                    .sort((a, b) => {
                      return a.brand.localeCompare(b.brand);
                    })
                    .map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                        onClick={() =>
                          product.id &&
                          navigate('/manage-product/' + product.id)
                        }
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
                        <SingleTableItem>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(product.sell_price)}
                        </SingleTableItem>
                        <SingleTableItem>
                          {product.warehouse_position}
                        </SingleTableItem>
                        <SingleTableItem>
                          <IoInformationCircleSharp
                            size={20}
                            className="cursor-pointer"
                          />
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
              onClick={() => navigate('/manage-product/new')}
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
