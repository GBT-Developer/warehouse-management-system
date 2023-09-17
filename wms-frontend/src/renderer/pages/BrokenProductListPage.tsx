import { db } from 'firebase';
import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ReturnModal } from 'renderer/components/ReturnModal';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export const BrokenProductListPage = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const returnHandler = async () => {
    await runTransaction(db, async (transaction) => {
      if (!reason) {
        setErrorMessage('Please select a reason');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        return;
      }
      if (!activeProduct?.id) return Promise.reject('No product id');

      // First check whether the product exists in 'returned_product' collection
      const productQuery = query(
        collection(db, 'product'),
        where(documentId(), '==', activeProduct.id),
        where('available_color', '==', activeProduct.available_color),
        where('brand', '==', activeProduct.brand),
        where('motor_type', '==', activeProduct.motor_type),
        where('part', '==', activeProduct.part),
        where('supplier', '==', activeProduct.supplier)
      );

      const productQuerySnapshot = await getDocs(productQuery);
      const productId = activeProduct.id;
      if (productQuerySnapshot.empty) {
        // If the product does not exist in 'returned_product' collection, create it
        const newReturnedProductDocRef = doc(
          collection(db, 'returned_product')
        );
        transaction.set(newReturnedProductDocRef, {
          available_color: activeProduct.available_color,
          brand: activeProduct.brand,
          count: activeProduct.count,
          motor_type: activeProduct.motor_type,
          part: activeProduct.part,
          supplier: activeProduct.supplier,
        });
      } else {
        // If the product exists in 'returned_product' collection, update it
        const product = productQuerySnapshot.docs[0];
        const productData = product.data() as Product;
        transaction.update(product.ref, {
          count: parseInt(activeProduct.count) + parseInt(productData.count),
        });
      }

      // If the return was for a painter, create a new dispatch_note
      if (reason === 'painter') {
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
          painter: 'Asep', // Make this dynamic
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
                      <SingleTableItem>{product.count}</SingleTableItem>
                    </tr>
                  ))}
              </tbody>
            </table>
            <ReturnModal
              confirmHandler={returnHandler}
              confirmationMsg="Are you sure you want to return this product?"
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              product_id={activeProduct?.id}
            >
              <div className="flex gap-2">
                <span className="font-bold">Reason:</span>
                <div className="flex gap-4">
                  <label htmlFor="supplier" className="flex gap-[0.25rem]">
                    Supplier
                    <input
                      checked={reason === 'supplier'}
                      type="radio"
                      name="reason"
                      id="supplier"
                      value="supplier"
                      onChange={() => setReason('supplier')}
                    />
                  </label>
                  <label htmlFor="painter" className="flex gap-[0.25rem]">
                    Painter
                    <input
                      checked={reason === 'painter'}
                      type="radio"
                      name="reason"
                      id="painter"
                      value="painter"
                      onChange={() => setReason('painter')}
                    />
                  </label>
                </div>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm ">{errorMessage}</p>
              )}
            </ReturnModal>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
