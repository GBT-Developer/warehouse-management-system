import {
  QueryStartAtConstraint,
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const ReturnedProductListPage = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(
          collection(db, 'returned_product'),
          warehousePosition !== 'Semua Gudang'
            ? where('warehouse_position', '==', warehousePosition)
            : where('warehouse_position', 'in', [
                'Gudang Bahan',
                'Gudang Jadi',
              ]),
          orderBy('brand', 'asc'),
          limit(50)
        );
        setLoading(true);
        const querySnapshot = await getDocs(productsQuery);

        if (querySnapshot.docs.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const suppliersMap = new Map<string, Supplier | undefined>();

        // Get suppliers needed for the products
        querySnapshot.forEach((product) => {
          const data = product.data() as {
            available_color: string;
            brand: string;
            count: string;
            motor_type: string;
            part: string;
            warehouse_position: string;
            supplier: string;
          };
          // Check if the supplier is already in the map
          if (!suppliersMap.has(data.supplier))
            suppliersMap.set(data.supplier, undefined);
        });

        if (suppliersMap.size === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Get the suppliers' names
        const suppliersQuery = query(
          collection(db, 'supplier'),
          where(documentId(), 'in', Array.from(suppliersMap.keys()))
        );

        const suppliersQuerySnapshot = await getDocs(suppliersQuery);

        suppliersQuerySnapshot.forEach((supplier) => {
          const data = supplier.data() as Supplier;
          data.id = supplier.id;
          if (data.id) suppliersMap.set(data.id, data);
        });

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          const supplierId = data.supplier as unknown as string;
          data.supplier = suppliersMap.get(supplierId);
          productData.push(data);
        });

        const nextQ = startAfter(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );

        setNextQuery(nextQ);
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

  // Fetch next posts
  const fetchNextPosts = async () => {
    try {
      if (nextQuery === null) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }
      setNextPostsLoading(true);
      const q = query(
        collection(db, 'returned_product'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('brand', 'asc'),
        limit(50),
        nextQuery
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length === 0) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      const suppliersMap = new Map<string, Supplier | undefined>();

      // Get suppliers needed for the products
      querySnapshot.forEach((product) => {
        const data = product.data() as {
          available_color: string;
          brand: string;
          count: string;
          motor_type: string;
          part: string;
          warehouse_position: string;
          supplier: string;
          date: string;
          time: string;
        };
        // Check if the supplier is already in the map
        if (!suppliersMap.has(data.supplier))
          suppliersMap.set(data.supplier, undefined);
      });

      if (suppliersMap.size === 0) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      // Get the suppliers' names
      const suppliersQuery = query(
        collection(db, 'supplier'),
        where(documentId(), 'in', Array.from(suppliersMap.keys()))
      );

      const suppliersQuerySnapshot = await getDocs(suppliersQuery);

      suppliersQuerySnapshot.forEach((supplier) => {
        const data = supplier.data() as Supplier;
        data.id = supplier.id;
        if (data.id) suppliersMap.set(data.id, data);
      });

      const productData: Product[] = [];
      querySnapshot.forEach((theProduct) => {
        const data = theProduct.data() as Product;
        data.id = theProduct.id;
        const supplierId = data.supplier as unknown as string;
        data.supplier = suppliersMap.get(supplierId);
        productData.push(data);
      });

      const nextQ = startAfter(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );

      setNextQuery(nextQ);
      setProducts((prev) => [...prev, ...productData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Retur Produk Supplier
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
                <th className=" py-3">Nama Produk</th>
                <th className=" py-3">Supplier</th>
                <th className=" py-3">Jumlah</th>
              </TableHeader>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={6}>
                      <p className="flex justify-center">Data tidak tersedia</p>
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
                        <SingleTableItem>
                          {product.supplier?.company_name}
                        </SingleTableItem>
                        <SingleTableItem>{product.count}</SingleTableItem>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <p className="text-gray-500 text-sm">No more data</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={fetchNextPosts}
                  disabled={nextPosts_loading}
                >
                  {nextPosts_loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                  ) : (
                    'Selanjutnya'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
