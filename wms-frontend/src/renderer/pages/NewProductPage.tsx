import { format } from 'date-fns';
import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
} from 'firebase/firestore';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { db } from 'renderer/firebase';
import { Product } from 'renderer/interfaces/Product';
import { PurchaseHistory } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

const newProductInitialState = {
  brand: '',
  motor_type: '',
  part: '',
  available_color: '',
  warehouse_position: '',
  count: 0,
  sell_price: 0,
  purchase_price: 0,
  supplier: undefined,
} as Product;

const newSupplierInitialState = {
  company_name: '',
  address: '',
  city: '',
  phone_number: '',
  bank_number: '',
  remarks: '',
  contact_person: '',
  bank_owner: '',
} as Supplier;

const newPurchaseInitialState = {
  created_at: '',
  purchase_price: 0,
  supplier: null,
  payment_status: 'unpaid',
  warehouse_position: '',
  products: [],
  time: '',
} as PurchaseHistory;

export const NewProductPage = () => {
  const [newProduct, setNewProduct] = useState<Product>(newProductInitialState);
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  const { warehousePosition, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const warehouseOptionRef = useRef<HTMLSelectElement>(null);
  const supplierOptionRef = useRef<HTMLSelectElement>(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSupplier] = useState<Supplier[]>([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Supplier>(
    newSupplierInitialState
  );
  const [newPurchase, setNewPurchase] = useState<PurchaseHistory>(
    newPurchaseInitialState
  );
  const successNotify = () => toast.success('Produk berhasil ditambahkan');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Product gagal ditambahkan');
  const [isEmpty, setIsEmpty] = useState(false);
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
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    console.log(newProduct);
  }, [newProduct]);

  // Check all of the input empty or not
  useEffect(() => {
    if (
      newProduct.brand === '' ||
      newProduct.motor_type === '' ||
      newProduct.part === '' ||
      (newProduct.available_color === '' &&
        warehousePosition !== 'Gudang Bahan') ||
      newProduct.warehouse_position === ''
    ) {
      setIsEmpty(true);
      return;
    } else if (
      (newProduct.available_color !== '' ||
        warehousePosition === 'Gudang Bahan') &&
      newProduct.brand != '' &&
      newProduct.motor_type != '' &&
      newProduct.part != '' &&
      newProduct.warehouse_position != ''
    ) {
      setIsEmpty(false);
      return;
    }
  }, [newProduct, newPurchase]);
  useEffect(() => {
    if (!initialLoad) navigate('/');

    setInitialLoad(false);
  }, [warehousePosition]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // If one or more fields are empty except color if warehouse position is Gudang Bahan, show error message
    if (
      newProduct.brand === '' ||
      newProduct.motor_type === '' ||
      newProduct.part === '' ||
      (newProduct.available_color === '' &&
        warehousePosition !== 'Gudang Bahan') ||
      newProduct.warehouse_position === ''
    ) {
      setErrorMessage('Tolong isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (
      Number.isNaN(Number(newProduct.sell_price)) ||
      Number.isNaN(Number(newProduct.purchase_price)) ||
      Number.isNaN(Number(newProduct.count)) ||
      Number(newProduct.sell_price) < 0 ||
      Number(newProduct.purchase_price) < 0 ||
      Number(newProduct.count) < 0
    ) {
      setErrorMessage('Harga jual, harga beli, dan jumlah harus angka');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    await runTransaction(db, (transaction) => {
      setLoading(true);
      let newSupplierRef: DocumentReference<DocumentData, DocumentData> | null =
        null;

      if (showSupplierForm) {
        newSupplierRef = doc(collection(db, 'supplier'));
        transaction.set(newSupplierRef, newSupplier);
      }
      const newProductRef = doc(collection(db, 'product'));
      if (newProduct.supplier?.id == null) {
        transaction.set(newProductRef, {
          ...newProduct,
          supplier: newSupplierRef ? newSupplierRef.id : null,
        });
      } else if (newProduct.supplier?.id != '') {
        transaction.set(newProductRef, {
          ...newProduct,
          supplier: newProduct.supplier?.id,
        });
      }
      if (
        newProduct.count != 0 &&
        newProduct.purchase_price != 0 &&
        newProduct.sell_price != 0 &&
        newProduct.supplier?.id != ''
      ) {
        const currentDateandTime = new Date();
        const newPurchaseRef = doc(collection(db, 'purchase_history'));
        const todayDate = format(currentDateandTime, 'yyyy-MM-dd');
        let theTime = '';
        // If invoice date is the same as current date, take the current time
        if (newPurchase.created_at === format(currentDateandTime, 'yyyy-MM-dd'))
          theTime = format(currentDateandTime, 'HH:mm:ss');
        else theTime = '23:59:59';

        transaction.set(newPurchaseRef, {
          ...newPurchase,
          created_at: todayDate,
          time: theTime,
          purchase_price: newProduct.purchase_price,
          payment_status: newPurchase.payment_status,
          warehouse_position: newProduct.warehouse_position,
          supplier: newSupplierRef
            ? newSupplierRef.id
            : newProduct.supplier?.id,
          products: [
            {
              id: newProductRef.id,
              name: `${newProduct.brand} ${newProduct.motor_type} ${newProduct.part} ${newProduct.available_color}`,
              quantity: newProduct.count,
            },
          ],
        });
      }
      setLoading(false);
      setIsEmpty(false);
      successNotify();
      setNewProduct(newProductInitialState);
      setNewSupplier(newSupplierInitialState);
      setNewPurchase(newPurchaseInitialState);
      //make the supplier select empty
      if (supplierOptionRef.current) supplierOptionRef.current.value = '';
      //make the warehouse select empty
      if (warehouseOptionRef.current) warehouseOptionRef.current.value = '';
      return Promise.resolve(newProductRef);
    }).catch((error) => {
      setLoading(false);
      const errorMessage = error as unknown as string;
      failNotify(errorMessage);
    });
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Tambah Produk Baru
      </h1>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch((error) => {
            console.log(error);
          });
        }}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <InputField
          loading={loading}
          labelFor="brand"
          label="Merek"
          value={newProduct.brand}
          onChange={(e) =>
            setNewProduct({ ...newProduct, brand: e.target.value })
          }
        />
        <InputField
          loading={loading}
          labelFor="type"
          label="Tipe Motor"
          value={newProduct.motor_type}
          onChange={(e) =>
            setNewProduct({ ...newProduct, motor_type: e.target.value })
          }
        />
        <InputField
          loading={loading}
          labelFor="part"
          label="Part"
          value={newProduct.part}
          onChange={(e) =>
            setNewProduct({ ...newProduct, part: e.target.value })
          }
        />
        {(warehousePosition === 'Semua Gudang' ||
          warehousePosition === 'Gudang Jadi') &&
          newProduct.warehouse_position !== 'Gudang Bahan' && (
            <InputField
              loading={loading}
              labelFor="available_color"
              label="Warna"
              value={newProduct.available_color}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  available_color: e.target.value,
                })
              }
            />
          )}
        <InputField
          loading={loading}
          labelFor="count"
          label="Jumlah Barang"
          value={newProduct.count}
          onChange={(e) => {
            if (
              !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
              e.target.value !== ''
            )
              return;
            setNewProduct({ ...newProduct, count: Number(e.target.value) });
          }}
        />
        <InputField
          loading={loading}
          labelFor="purchase_price"
          label="Harga Beli"
          value={newProduct.purchase_price}
          onChange={(e) => {
            if (
              !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
              e.target.value !== ''
            )
              return;
            setNewProduct({
              ...newProduct,
              purchase_price: Number(e.target.value),
            });
          }}
        />
        <InputField
          loading={loading}
          labelFor="sell_price"
          label="Harga Jual"
          value={newProduct.sell_price}
          onChange={(e) => {
            if (
              !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
              e.target.value !== ''
            )
              return;
            setNewProduct({
              ...newProduct,
              sell_price: Number(e.target.value),
            });
          }}
        />
        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'warehouse'} className="text-md">
                Posisi Gudang
              </label>
            </div>
            <div className="w-2/3">
              <select
                defaultValue={''}
                ref={warehouseOptionRef}
                disabled={loading}
                id="warehouse-position"
                name="warehouse-position"
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    warehouse_position: e.target.value,
                  });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value={''} disabled>
                  Pilih Gudang
                </option>
                {warehousePosition !== 'Gudang Bahan' && (
                  <option value="Gudang Jadi">Gudang Jadi</option>
                )}
                {warehousePosition !== 'Gudang Jadi' && (
                  <option value="Gudang Bahan">Gudang Bahan</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'supplier'} className="text-md">
                Supplier
              </label>
            </div>
            <div className="w-2/3">
              <select
                ref={supplierOptionRef}
                defaultValue={''}
                disabled={loading}
                id="supplier"
                name="supplier"
                onChange={(e) => {
                  if (e.target.value === 'New Supplier')
                    setShowSupplierForm(true); // Show the supplier form
                  else {
                    const supplier = suppliers.find(
                      (supplier) => supplier.id === e.target.value
                    );
                    if (!supplier) return;
                    setNewProduct({
                      ...newProduct,
                      supplier: supplier,
                    });
                    setShowSupplierForm(false); // Hide the supplier form
                  }
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value={''} disabled>
                  Pilih Supplier
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </option>
                ))}
                {user?.role.toLowerCase() === 'owner' && (
                  <option value="New Supplier">Tambah Supplier Baru</option>
                )}
              </select>{' '}
            </div>
          </div>
        </div>

        {showSupplierForm && (
          <>
            <InputField
              loading={loading}
              label="Nama Perusahaan"
              labelFor="company_name"
              value={newSupplier.company_name}
              placeholder="i.e. PT. Berkat Abadi"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, company_name: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="Alamat"
              labelFor="address"
              value={newSupplier.address}
              placeholder="i.e. Jl.Soekarno-Hatta No. 123"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, address: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="Kota"
              labelFor="city"
              value={newSupplier.city}
              placeholder="i.e. 10120, Jakarta"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, city: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="Nomor Telepon"
              labelFor="phone_number"
              value={newSupplier.phone_number}
              placeholder="081234567890"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, phone_number: e.target.value })
              }
            />
            <InputField
              loading={loading}
              labelFor="contact_person"
              label="Narahubung"
              value={newSupplier.contact_person}
              placeholder='i.e "John Doe"'
              onChange={(e) =>
                setNewSupplier({
                  ...newSupplier,
                  contact_person: e.target.value,
                })
              }
            />
            <InputField
              loading={loading}
              label="Nomor Rekening"
              labelFor="bank_number"
              value={newSupplier.bank_number}
              placeholder="1234567890"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, bank_number: e.target.value })
              }
            />
            <InputField
              loading={loading}
              labelFor="bank_owner"
              label="Atas Nama"
              value={newSupplier.bank_owner}
              placeholder='i.e "John Doe"'
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, bank_owner: e.target.value })
              }
            />
            <AreaField
              loading={loading}
              label="Catatan"
              labelFor="remarks"
              maxLength={300}
              rows={7}
              value={newSupplier.remarks ?? ''}
              placeholder="Info tambahan... (max. 300 characters)"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, remarks: e.target.value })
              }
            />
          </>
        )}
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Tambah Baru
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Batal
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
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
