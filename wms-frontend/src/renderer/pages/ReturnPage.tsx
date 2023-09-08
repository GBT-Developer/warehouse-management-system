import { db } from 'firebase';
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useParams } from 'react-router-dom';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { Product } from 'renderer/interfaces/Product';
import { Retoure } from 'renderer/interfaces/Retoure';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

export default function ReturnPage() {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [editToggle, setEditToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<Supplier>();
  const statusOptionRef = useRef<HTMLSelectElement>(null);
  const [newRetoure, setNewRetoure] = useState<Retoure>();
  const productOptionRef = useRef<HTMLSelectElement>(null);
  const currentTimeStamp = Timestamp.now();

  useEffect(() => {
    const fetchData = async () => {
      try {
        //take products from firestore
        const productsQuery = query(collection(db, 'product'));
        const querySnapshot = await getDocs(productsQuery);

        const productData: Product[] = [];
        querySnapshot.forEach((theProduct) => {
          const data = theProduct.data() as Product;
          data.id = theProduct.id;
          productData.push(data);
        });

        setProducts(productData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);
  console.log(products);

  function handleSubmit(e: { preventDefault: () => void }) {
    //input newRetoure to the database
    e.preventDefault();
    if (
      !newRetoure?.product_name ||
      !newRetoure?.count ||
      !newRetoure?.remarks
    ) {
      setErrorMessage('Please fill all the fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    setLoading(true);
    const newRetoureRef = collection(db, 'retoure');
    addDoc(newRetoureRef, newRetoure)
      .then(() => {
        console.log('Document successfully written!');
        setLoading(false);
        setNewRetoure(undefined);
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
        setLoading(false);
      });
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Retoure Page
      </h1>
      <form
        onSubmit={handleSubmit}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'product'} className="text-md">
                Invoice Number
              </label>
            </div>
            <div className="w-2/3">
              <select
                ref={productOptionRef}
                defaultValue={''}
                disabled={loading}
                id="product"
                name="product"
                onChange={(e) => {
                  const product = products.find(
                    (product) => product.id === e.target.value
                  );
                  if (!product) return;
                  setNewRetoure({ ...newRetoure, product: product });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value={''} disabled>
                  Choose Invoice number
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.id}
                  </option>
                ))}
              </select>{' '}
            </div>
          </div>
        </div>
        <InputField
          loading={loading}
          label="Product"
          labelFor="product_name"
          value={newRetoure?.product_name ?? ''}
          placeholder="i.e. Yamaha Aerox "
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, product_name: e.target.value });
          }}
        />

        <InputField
          label="Count"
          labelFor="count"
          value={newRetoure?.count ?? ''}
          placeholder="i.e. 2"
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, count: e.target.value });
          }}
        />
        <AreaField
          label="Remarks"
          labelFor="remarks"
          maxLength={300}
          rows={7}
          value={newRetoure?.remarks ?? ''}
          placeholder="Additional info... (max. 300 characters)"
          onChange={(e) => {
            setNewRetoure({ ...newRetoure, remarks: e.target.value });
          }}
        />
        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'warehouse'} className="text-md">
                Status
              </label>
            </div>
            <div className="w-2/3">
              <select
                defaultValue={''}
                ref={statusOptionRef}
                disabled={loading}
                id="status"
                name="status"
                onChange={(e) => {
                  setNewRetoure({
                    ...newRetoure,
                    status: e.target.value,
                  });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value={''} disabled>
                  Choose Status
                </option>
                <option value="Return">Return</option>
                <option value="Exchanged">Exchanged</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Retoure date
            </label>
          </div>
          <div className="w-2/3">
            <input
              disabled={loading}
              type="date"
              name="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => {
                setNewRetoure(() => ({
                  ...newRetoure,
                  created_at: e.target.value,
                }));
              }}
            />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Submit
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
    </PageLayout>
  );
}
