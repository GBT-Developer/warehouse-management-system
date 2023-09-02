import { db } from 'firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
} from 'firebase/firestore';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { Product } from 'renderer/interfaces/Product';
import { Purchase_History } from 'renderer/interfaces/PurchaseHistory';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newProductInitialState = {
  brand: '',
  motor_type: '',
  part: '',
  available_color: '',
  warehouse_position: '',
  count: '',
  sell_price: '',
};

const newSupplierInitialState = {
  company_name: '',
  address: '',
  city: '',
  phone_number: '',
  bank_number: '',
  remarks: '',
} as Supplier;

const newPurchaseInitialState = {
  created_at: '',
  count: '',
  purchase_price: '',
  supplier: null,
  product: null,
  payment_status: '',
} as Purchase_History;

export const NewProductPage = () => {
  const [newProduct, setNewProduct] = useState<Product>(newProductInitialState);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const warehouseOptionRef = useRef<HTMLSelectElement>(null);
  const supplierOptionRef = useRef<HTMLSelectElement>(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSupplier] = useState<Supplier[]>([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Supplier>(
    newSupplierInitialState
  );
  const [newPurchase, setNewPurchase] = useState<Purchase_History>(
    newPurchaseInitialState
  );

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
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // If one or more fields are empty, return early
    if (
      Object.values(newProduct).some(
        (value) => value === '' || value === undefined
      ) ||
      newProduct.warehouse_position === ''
    ) {
      console.log(newProduct);
      setErrorMessage('Please fill all the fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (
      Number.isNaN(Number(newProduct.sell_price)) ||
      Number.isNaN(Number(newPurchase.purchase_price)) ||
      Number.isNaN(Number(newProduct.count)) ||
      Number(newProduct.sell_price) <= 0 ||
      Number(newPurchase.purchase_price) <= 0 ||
      Number(newProduct.count) <= 0
    ) {
      setErrorMessage('Please input a valid number');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);

    await runTransaction(db, (transaction) => {
      let newSupplierRef = null;

      if (showSupplierForm) {
        newSupplierRef = doc(collection(db, 'supplier'));
        transaction.set(newSupplierRef, newSupplier);
      }

      const newProductRef = doc(collection(db, 'product'));
      transaction.set(newProductRef, {
        ...newProduct,
        supplier: newProduct.supplier?.id,
      });

      const newPurchaseRef = doc(collection(db, 'purchase_history'));
      transaction.set(newPurchaseRef, {
        ...newPurchase,
        payment_status: 'unpaid',
        created_at: new Date().toISOString(),
        product: newProductRef.id,
        supplier: newSupplierRef ? newSupplierRef.id : newProduct.supplier?.id,
      });

      return Promise.resolve(newProductRef);
    }).catch((error) => {
      console.log(error);
    });

    setLoading(false);
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Add new product
      </h1>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch((error) => {
            console.log(error);
          });
        }}
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <InputField
          loading={loading}
          labelFor="brand"
          label="Brand"
          value={newProduct.brand}
          onChange={(e) =>
            setNewProduct({ ...newProduct, brand: e.target.value })
          }
        />
        <InputField
          loading={loading}
          labelFor="type"
          label="Motorcycle Type"
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
        <InputField
          loading={loading}
          labelFor="available_color"
          label="Available Color"
          value={newProduct.available_color}
          onChange={(e) =>
            setNewProduct({ ...newProduct, available_color: e.target.value })
          }
        />
        <InputField
          loading={loading}
          labelFor="count"
          label="Product Count"
          value={newProduct.count}
          onChange={(e) => {
            setNewProduct({ ...newProduct, count: e.target.value });
            setNewPurchase({ ...newPurchase, count: e.target.value });
          }}
        />
        <InputField
          loading={loading}
          labelFor="purchase_price"
          label="Purchase Price"
          value={newPurchase.purchase_price}
          onChange={(e) =>
            setNewPurchase({
              ...newPurchase,
              purchase_price: e.target.value,
            })
          }
        />
        <InputField
          loading={loading}
          labelFor="sell_price"
          label="Sell Price"
          value={newProduct.sell_price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, sell_price: e.target.value })
          }
        />
        <div>
          <div className="flex justify-between">
            <div className="w-1/3 py-1.5">
              <label htmlFor={'warehouse'} className="text-md">
                Warehouse Position
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
                  Choose Warehouse
                </option>
                <option value="Gudang Jadi">Gudang Jadi</option>
                <option value="Gudang Bahan">Gudang Bahan</option>
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
                  Choose Supplier
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </option>
                ))}
                <option value="New Supplier">Add New Supplier</option>
              </select>{' '}
            </div>
          </div>
        </div>

        {showSupplierForm && (
          <>
            <InputField
              loading={loading}
              label="Company Name"
              labelFor="company_name"
              value={newSupplier.company_name}
              placeholder="i.e. PT. Berkat Abadi"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, company_name: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="Address"
              labelFor="address"
              value={newSupplier.address}
              placeholder="i.e. Jl.Soekarno-Hatta No. 123"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, address: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="City"
              labelFor="city"
              value={newSupplier.city}
              placeholder="i.e. 10120, Jakarta"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, city: e.target.value })
              }
            />
            <InputField
              loading={loading}
              label="Contact Number"
              labelFor="phone_number"
              value={newSupplier.phone_number}
              placeholder="Phone number or landline number"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, phone_number: e.target.value })
              }
            />
            <InputField
              loading={loading}
              labelFor="contact_person"
              label="Contact Person"
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
              label="Bank Number"
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
              label="Bank Owner"
              value={newSupplier.bank_owner}
              placeholder='i.e "John Doe"'
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, bank_owner: e.target.value })
              }
            />
            <AreaField
              loading={loading}
              label="Remarks"
              labelFor="remarks"
              maxLength={300}
              rows={7}
              value={newSupplier.remarks ?? ''}
              placeholder="Additional info... (max. 300 characters)"
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, remarks: e.target.value })
              }
            />
          </>
        )}
        <div className="flex flex-row-reverse gap-2 justify-start">
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
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
    </PageLayout>
  );
};
