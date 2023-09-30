import { db } from 'firebase';
import {
  QueryStartAtConstraint,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReturnModal } from 'renderer/components/ReturnModal';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const BrokenProductListPage = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { warehousePosition } = useAuth();
  const [painterName, setPainterName] = useState('');
  const successNotify = () =>
    toast.success('Product status successfully updated');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Failed to update product status');
  const [lastBrandKey, setLastBrandKey] = useState(null);
  const [nextPosts_loading, setNextPostsLoading] = useState(false);
  const [nextPosts_empty, setNextPostsEmpty] = useState(false);
  const [nextQuery, setNextQuery] = useState<QueryStartAtConstraint | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(
          collection(db, 'broken_product'),
          warehousePosition !== 'Both'
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
          setLastBrandKey(theProduct.data().brand);
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
      if (nextQuery === null) return;
      setNextPostsLoading(true);
      const productsQuery = query(
        collection(db, 'broken_product'),
        warehousePosition !== 'Both'
          ? where('warehouse_position', '==', warehousePosition)
          : where('warehouse_position', 'in', ['Gudang Bahan', 'Gudang Jadi']),
        orderBy('brand', 'asc'),
        startAfter(lastBrandKey),
        limit(50),
        nextQuery
      );

      const querySnapshot = await getDocs(productsQuery);

      if (querySnapshot.empty) {
        setNextPostsEmpty(true);
        setNextPostsLoading(false);
        return;
      }

      const productData: Product[] = [];
      querySnapshot.forEach((theProduct) => {
        const data = theProduct.data() as Product;
        data.id = theProduct.id;
        productData.push(data);
        setLastBrandKey(theProduct.data().brand);
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

  const returnHandler = async () => {
    await runTransaction(db, async (transaction) => {
      if (!reason) {
        setErrorMessage('Please select a reason');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        return;
      }
      if (!painterName && reason === 'painter') {
        setErrorMessage('Please enter the painter name');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        return;
      }
      if (!activeProduct?.id) return Promise.reject('No product id');

      const productId = activeProduct.id;
      if (reason === 'supplier') {
        // First check whether the product exists in 'returned_product' collection
        const newReturnedProductDocRef = doc(
          collection(db, 'returned_product'),
          productId
        );
        const updateStock = increment(activeProduct.count);
        transaction.set(
          newReturnedProductDocRef,
          {
            available_color: activeProduct.available_color,
            brand: activeProduct.brand,
            count: updateStock,
            motor_type: activeProduct.motor_type,
            part: activeProduct.part,
            supplier: activeProduct.supplier,
            warehouse_position: activeProduct.warehouse_position,
          },
          {
            merge: true,
          }
        );
      } else if (reason === 'painter') {
        // If the return was for a painter, create a new dispatch_note
        // Creating new dispatch_note
        const newDispatchNoteDocRef = doc(collection(db, 'dispatch_note'));
        transaction.set(newDispatchNoteDocRef, {
          // Date example: 2023-09-17
          date: new Date().toISOString().slice(0, 10),
          dispatch_items: [
            {
              amount: activeProduct.count,
              color: activeProduct.available_color,
              product_id: productId,
            },
          ],
          painter: painterName,
        });

        // Creating new on_dispatch (products)
        const newOnDispatchDocRef = doc(collection(db, 'on_dispatch'));

        transaction.set(newOnDispatchDocRef, {
          id: productId,
          available_color: activeProduct.available_color,
          brand: activeProduct.brand,
          count: activeProduct.count,
          dispatch_note_id: newDispatchNoteDocRef.id,
          motor_type: activeProduct.motor_type,
          part: activeProduct.part,
          status: 'Under painting',
          supplier: activeProduct.supplier,
          warehouse_position: 'Gudang Bahan',
          sell_price: activeProduct.sell_price,
        });
      }

      // Delete the product from 'broken_product' collection
      transaction.delete(doc(db, 'broken_product', productId));
      setProducts((prev) => {
        const newProducts = prev.filter((product) => product.id !== productId);
        return newProducts;
      });
      setReason('');
      setModalOpen(false);
      return Promise.resolve();
    })
      .then(() => successNotify())
      .catch((error) => {
        const errorMessage = error as string;
        failNotify(errorMessage);
      });
  };

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
                <th className=" py-3">Warehouse Origin Position</th>
                <th className=" py-3">Amount</th>
              </TableHeader>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={3}>
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
                      if (
                        a.available_color === undefined ||
                        b.available_color === undefined
                      )
                        return 0;
                      return a.available_color.localeCompare(b.available_color);
                    })
                    .sort((a, b) => {
                      if (a.part === undefined || b.part === undefined)
                        return 0;
                      return a.part.localeCompare(b.part);
                    })
                    .sort((a, b) => {
                      if (
                        a.motor_type === undefined ||
                        b.motor_type === undefined
                      )
                        return 0;
                      return a.motor_type.localeCompare(b.motor_type);
                    })
                    .sort((a, b) => {
                      if (a.brand === undefined || b.brand === undefined)
                        return 0;
                      return a.brand.localeCompare(b.brand);
                    })

                    .map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                        onClick={() => {
                          if (!product.id) return;
                          setReason('');
                          setModalOpen(true);
                          setActiveProduct(product);
                        }}
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
                          {product.warehouse_position}
                        </SingleTableItem>
                        <SingleTableItem>{product.count}</SingleTableItem>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            {nextPosts_empty ? (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <p className="text-gray-500 text-sm">No more data</p>
              </div>
            ) : (
              <div className="flex justify-center items-center py-6 px-3 w-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => fetchMoreData()}
                >
                  {nextPosts_loading ? (
                    <div className="flex justify-center items-center">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                    </div>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
            <ReturnModal
              confirmHandler={returnHandler}
              confirmationMsg="Are you sure you want to return this product?"
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              product_id={activeProduct?.id}
            >
              <div className="flex">
                <p className="w-2/5 font-bold">Return to:</p>
                <div className="w-3/5 flex gap-4">
                  <label
                    htmlFor="supplier"
                    className="flex gap-[0.25rem] cursor-pointer"
                  >
                    Supplier
                    <input
                      checked={reason === 'supplier'}
                      type="radio"
                      name="reason"
                      id="supplier"
                      value="supplier"
                      onChange={() => setReason('supplier')}
                      className="cursor-pointer"
                    />
                  </label>
                  {activeProduct?.warehouse_position === 'Gudang Jadi' && (
                    <label
                      htmlFor="painter"
                      className="flex gap-[0.25rem] cursor-pointer"
                    >
                      Painter
                      <input
                        checked={reason === 'painter'}
                        type="radio"
                        name="reason"
                        id="painter"
                        value="painter"
                        onChange={() => setReason('painter')}
                        className="cursor-pointer"
                      />
                    </label>
                  )}
                </div>
              </div>
              {reason === 'painter' && (
                <div className="flex items-center">
                  <p className="w-2/5 font-bold">Painter's name:</p>
                  <div className="w-3/5 flex gap-4">
                    <input
                      type="text"
                      name="painter_name"
                      id="painter_name"
                      value={painterName}
                      onChange={(e) => setPainterName(e.target.value)}
                      className={
                        'placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full'
                      }
                    />
                  </div>
                </div>
              )}
              {errorMessage && (
                <p className="text-red-500 text-sm ">{errorMessage}</p>
              )}
            </ReturnModal>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </PageLayout>
  );
};
