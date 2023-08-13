import { addDoc, collection } from 'firebase/firestore';
import { db } from 'firebase';
import { useState } from 'react';
import { Product } from 'renderer/interfaces/Product';
import { StockInputField } from 'renderer/components/StockInputField';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { PageLayout } from 'renderer/layout/PageLayout';

const newProductInitialState = {
  brand: '',
  motor_type: '',
  part: '',
  available_color: '',
  price: '',
  warehouse_position: '',
  count: '',
};

export const ManageProductPage = () => {
  const [newProduct, setNewProduct] = useState<Product>(newProductInitialState);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    // If one or more fields are empty, return early
    if (
      Object.values(newProduct).some(
        (value) => value === '' || value === undefined
      )
    ) {
      setErrorMessage('Mohon isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (
      Number.isNaN(Number(newProduct.price)) ||
      Number.isNaN(Number(newProduct.count)) ||
      Number(newProduct.price) <= 0 ||
      Number(newProduct.count) <= 0
    ) {
      setErrorMessage('Harga atau jumlah barang tidak valid');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);

    const productCollection = collection(db, '/product');

    addDoc(productCollection, newProduct)
      .then(() => {
        setNewProduct(newProductInitialState);
        setLoading(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        setLoading(false);
      });
  }

  return (
    <PageLayout>
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
        Kelola Produk
      </h1>
      <form
        onSubmit={handleSubmit}
        className={`w-full flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center dark:bg-opacity-50 py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2 w-full">
          <StockInputField
            loading={loading}
            labelFor="brand"
            label="Merek"
            value={newProduct.brand}
            onChange={(e) =>
              setNewProduct({ ...newProduct, brand: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="motor_type"
            label="Jenis motor"
            value={newProduct.motor_type}
            onChange={(e) =>
              setNewProduct({ ...newProduct, motor_type: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="part"
            label="Part"
            value={newProduct.part}
            onChange={(e) =>
              setNewProduct({ ...newProduct, part: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="available_color"
            label="Warna tersedia"
            value={newProduct.available_color}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                available_color: e.target.value,
              })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="count"
            label="Jumlah barang"
            value={newProduct.count}
            onChange={(e) =>
              setNewProduct({ ...newProduct, count: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="price"
            label="Harga barang (Rp)"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
        </div>
        <StockInputField
          loading={loading}
          labelFor="warehouse_position"
          label="Posisi gudang"
          value={newProduct.warehouse_position}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              warehouse_position: e.target.value,
            })
          }
        />
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
        <div className="flex flex-row-reverse gap-2 w-full justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Submit
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </PageLayout>
  );
};
