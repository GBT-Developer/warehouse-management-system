import { db } from 'firebase';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { StockInputField } from 'renderer/components/StockInputField';
import { Product } from 'renderer/interfaces/Product';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newProductInitialState = {
  brand: '',
  motor_type: '',
  part: '',
  available_color: '',
  price: '',
  initial_cost: '',
  warehouse_position: '',
  count: '',
  supplier: '',
};

export const ManageProductPage = () => {
  const [newProduct, setNewProduct] = useState<Product>(newProductInitialState);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSupplier] = useState<Supplier[]>([]);

  // Take product from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'supplier'));
        const querySnapshot = await getDocs(q);

        const supplierData: Supplier[] = [];
        querySnapshot.forEach((theSupplier) => {
          const data = theSupplier.data() as Supplier;
          data.id = theSupplier.id;
          supplierData.push(data);
        });

        setSupplier(supplierData);
        console.log(supplierData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // If one or more fields are empty, return early
    if (
      Object.values(newProduct).some(
        (value) => value === '' || value === undefined
      ) ||
      newProduct.warehouse_position === ''
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
      Number.isNaN(Number(newProduct.initial_cost)) ||
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
        // Set the select value back to default
        if (selectRef.current) selectRef.current.value = '';

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
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Kelola Produk
      </h1>
      <form
        onSubmit={handleSubmit}
        className={`w-full flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
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
            value={newProduct.available_color.toLowerCase()}
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
            label="Harga Jual (Rp)"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            labelFor="price"
            label="Harga modal (Rp)"
            value={newProduct.initial_cost}
            onChange={(e) =>
              setNewProduct({ ...newProduct, initial_cost: e.target.value })
            }
          />
        </div>
        <label
          htmlFor="countries"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Posisi barang di gudang
          <select
            ref={selectRef}
            disabled={loading}
            id="countries"
            name="countries"
            onChange={(e) => {
              setNewProduct({
                ...newProduct,
                warehouse_position: e.target.value,
              });
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="" selected>
              Pilih gudang
            </option>
            <option value="gudang_jadi">Gudang Jadi</option>
            <option value="gudang_bahan">Gudang Bahan</option>
          </select>
        </label>
        <label
          htmlFor="countries"
          className="block mb-2 text-sm font-medium text-gray-900 "
        >
          Supplier barang
          <select
            ref={selectRef}
            disabled={loading}
            id="countries"
            name="countries"
            onChange={(e) => {
              setNewProduct({
                ...newProduct,
                supplier: e.target.value,
              });
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="" selected>
              Pilih Supplier
            </option>
            {suppliers.map((supplier) => (
              <option value={supplier.company_name}>
                {supplier.company_name}
              </option>
            ))}
          </select>
        </label>

        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
        <div className="flex flex-row-reverse gap-2 w-full justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Submit
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </PageLayout>
  );
};
