import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { PDFViewer } from '@react-pdf/renderer';
import {
  QueryStartAtConstraint,
  limit,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { PiFilePdfBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { ProductPdf } from 'renderer/components/ManageProductPDF';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const ManageProductPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pdfConfirmation, setPdfConfirmation] = useState(false);
  const [downloadedProducts, setDownloadedProducts] = useState<Product[]>([]);
  const { companyInfo } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(
          collection(db, 'product'),
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

        if (querySnapshot.empty) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
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

  const fetchMoreData = async () => {
    try {
      if (nextQuery === null) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }
      setNextPostsLoading(true);
      const productsQuery = query(
        collection(db, 'product'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('brand', 'asc'),
        nextQuery,
        limit(50)
      );

      const querySnapshot = await getDocs(productsQuery);

      setNextQuery(
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
      );

      if (querySnapshot.empty) {
        //disable load more button
        setNextPostsEmpty(true);
        return;
      }

      const productData: Product[] = [];
      querySnapshot.forEach((theProduct) => {
        const data = theProduct.data() as Product;
        data.id = theProduct.id;
        productData.push(data);
      });

      setProducts((prev) => [...prev, ...productData]);
      setNextPostsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDownload = async () => {
    try {
      // Query products starting from the last product in the products array
      const lastVisibleProduct = products[products.length - 1];
      if (nextQuery === null) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      const productsQuery = query(
        collection(db, 'product'),
        warehousePosition !== 'Semua Gudang'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('brand', 'asc'),
        nextQuery
      );

      setLoading(true);

      const querySnapshot = await getDocs(productsQuery);

      const productData: Product[] = [...products];
      if (!querySnapshot.empty) {
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
        });
        setNextQuery(
          startAfter(querySnapshot.docs[querySnapshot.docs.length - 1])
        );
      } else {
        setNextQuery(null);
      }

      setDownloadedProducts(productData);
      setPdfConfirmation(true);
      setLoading(false);
      setProducts(productData);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Kelola Produk
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <div className="flex justify-start items-center pb-2 ">
              <button
                className="text-blue-700 bg-white focus:ring-4 focus:ring-white flex items-center gap-2 rounded-lg px-2 py-1 focus:outline-none hover:-translate-y-1 shadow-md"
                type="button"
                onClick={() => setShowConfirmation(true)}
              >
                Ekspor menjadi PDF <PiFilePdfBold size={20} />
              </button>
            </div>
            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Nama Produk</th>
                <th className=" py-3">Jumlah</th>
                <th className=" py-3">Harga Jual</th>
                <th className=" py-3">Posisi Gudang</th>
              </TableHeader>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={4}>
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
                  onClick={fetchMoreData}
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
          <div className=" absolute bottom-[2.5rem] right-[2.5rem]">
            <button
              type="submit"
              className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md"
              onClick={() => navigate('/manage-product/new')}
            >
              + Tambah
            </button>
          </div>
        </div>
        {showConfirmation && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 rounded-lg z-10 w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
            <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
              <p className="text-lg text-gray-900">
                Apakah anda yakin ingin mengunduh data produk menjadi PDF?
              </p>
              <div className="w-full flex justify-end mt-3">
                <div className="flex relative w-[fit-content] gap-3">
                  {loading && (
                    <p className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-sm z-0 bg-opacity-50">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-xl" />
                    </p>
                  )}
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Tidak
                  </button>
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      handleDownload();
                    }}
                  >
                    Ya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {pdfConfirmation && (
          <div
            className={`fixed top-0 left-0 right-0 z-50 ${
              pdfConfirmation ? 'block' : 'hidden'
            } w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 flex justify-center items-center backdrop-filter backdrop-blur-sm`}
            onClick={
              pdfConfirmation
                ? () => {
                    setPdfConfirmation(false);
                    setDownloadedProducts([]);
                  }
                : () => {}
            }
          >
            <PDFViewer className="w-3/5 h-[90%] rounded-lg">
              <ProductPdf
                products={downloadedProducts}
                companyInfo={companyInfo}
              />
            </PDFViewer>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
