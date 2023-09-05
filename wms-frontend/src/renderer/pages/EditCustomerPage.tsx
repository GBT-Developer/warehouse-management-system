import { collection, getDocs, query } from '@firebase/firestore';
import { db } from 'firebase';
import { and, doc, getDoc, or, updateDoc, where } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Customer } from 'renderer/interfaces/Customer';
import { SpecialPrice } from 'renderer/interfaces/SpecialPrice';
import { PageLayout } from 'renderer/layout/PageLayout';

const newCustomerInitialState = {
  name: '',
  address: '',
  phone_number: '',
  SpecialPrice: [],
} as Customer;

function EditCustomerPage() {
  const navigate = useNavigate();
  const param = useParams();
  const [newCustomer, setNewCustomer] = useState<Customer>(
    newCustomerInitialState
  );
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SpecialPrice[]>([]);
  const [products, setProducts] = useState<SpecialPrice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (param.id === undefined) return;
        const customerRef = doc(db, 'customer', param.id);
        const customerSnap = await getDoc(customerRef);
        const customerData = customerSnap.data() as Customer;
        customerData.id = customerSnap.id;
        setNewCustomer(customerData);

        setSelectedProducts(customerData.SpecialPrice);

        setLoading(false);
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
    // If one or more fields are empty except remarks, return early
    if (
      !newCustomer.name ||
      !newCustomer.address ||
      !newCustomer.phone_number
    ) {
      setErrorMessage('Please fill all the fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Check data type
    if (Number.isNaN(Number(newCustomer.phone_number))) {
      setErrorMessage('Please input a valid number');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (newCustomer.SpecialPrice.some((sp) => sp.price === '')) {
      setErrorMessage('Please enter prices for all selected products');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Update customer data
    setLoading(true);
    try {
      if (!param.id) return;
      const customerRef = doc(db, 'customer', param.id);
      await updateDoc(customerRef, {
        name: newCustomer.name,
        address: newCustomer.address,
        phone_number: newCustomer.phone_number,
        SpecialPrice: selectedProducts,
      });
      setLoading(false);
      navigate(-1);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  const handleSearch = async (search: string) => {
    const productsQuery = query(
      collection(db, 'product'),
      or(
        // query as-is:
        and(
          where('brand', '>=', search),
          where('brand', '<=', search + '\uf8ff')
        ),
        // capitalize first letter:
        and(
          where(
            'brand',
            '>=',
            search.charAt(0).toUpperCase() + search.slice(1)
          ),
          where(
            'brand',
            '<=',
            search.charAt(0).toUpperCase() + search.slice(1) + '\uf8ff'
          )
        ),
        // lowercase:
        and(
          where('brand', '>=', search.toLowerCase()),
          where('brand', '<=', search.toLowerCase() + '\uf8ff')
        )
      )
    );
    setLoading(true);
    const querySnapshot = await getDocs(productsQuery);

    const productData: SpecialPrice[] = [];
    querySnapshot.forEach((theProduct) => {
      const data = theProduct.data() as SpecialPrice;
      data.product_id = theProduct.id;
      data.price = theProduct.get('sell_price');
      productData.push(data);
    });

    setProducts(productData);
    setLoading(false);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Edit Customer
      </h1>
      <form
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
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
          label="Name"
          labelFor="name"
          value={newCustomer.name}
          placeholder="i.e. John Doe"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, name: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Address"
          labelFor="address"
          value={newCustomer.address}
          placeholder="i.e. Jl.Soekarno-Hatta No. 123"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, address: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Contact Number"
          labelFor="phone_number"
          value={newCustomer.phone_number}
          placeholder="Phone number or landline number"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, phone_number: e.target.value })
          }
        />

        <hr className="my-4" />
        <h2 className="text-2xl font-bold">Special Price</h2>
        <ul className="my-3 space-y-3 font-regular">
          {selectedProducts.map((product, index) => (
            <li key={index}>
              <div className="flex flex-row gap-2 justify-between items-center">
                <InputField
                  loading={loading}
                  label={
                    product.brand +
                    ' ' +
                    product.motor_type +
                    ' ' +
                    product.part +
                    ' ' +
                    product.available_color
                  }
                  labelFor="price"
                  value={product.price}
                  onChange={(e) => {
                    setSelectedProducts(
                      selectedProducts.map((p) => {
                        if (p === product) {
                          p.price = e.target.value;
                        }
                        return p;
                      })
                    );
                  }}
                />
                <button
                  type="button"
                  className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border:none hover:text-red-900 focus:z-10 focus:ring-4 focus:ring-gray-200"
                  onClick={() => {
                    setSelectedProducts(
                      selectedProducts.filter((p) => p !== product)
                    );
                    if (product.id) {
                      newCustomer.SpecialPrice =
                        newCustomer.SpecialPrice.filter(
                          (sp) => sp.product_id !== product.id
                        );
                    }
                  }}
                >
                  <IoRemoveCircleOutline size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {product.warehouse_position}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
          onClick={() => setModalOpen(true)}
        >
          + Add Products
        </button>

        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Submit
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
      <TableModal
        placeholder="Search by product brand"
        modalOpen={modalOpen}
        handleSearch={handleSearch}
        setModalOpen={setModalOpen}
        title={'Choose Product'}
        headerList={
          products.length > 0
            ? ['', 'Product name', 'Sell Price', 'Warehouse']
            : []
        }
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <tr
              key={index}
              className="border-b hover:shadow-md cursor-pointer"
              onClick={() => {
                if (
                  !selectedProducts.some(
                    (sp) => sp.product_id === product.product_id
                  )
                ) {
                  setSelectedProducts([...selectedProducts, product]);
                  if (product.id) {
                    newCustomer.SpecialPrice = [
                      ...newCustomer.SpecialPrice,
                      product,
                    ];
                  }
                } else {
                  setSelectedProducts(
                    selectedProducts.filter((p) => p !== product)
                  );
                  if (product.id) {
                    newCustomer.SpecialPrice = newCustomer.SpecialPrice.filter(
                      (sp) => sp.product_id !== product.id
                    );
                  }
                }
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={selectedProducts.some(
                    (sp) => sp.product_id === product.product_id
                  )}
                />
              </SingleTableItem>
              <SingleTableItem key={index}>
                {product.brand +
                  ' ' +
                  product.motor_type +
                  ' ' +
                  product.part +
                  ' ' +
                  product.available_color}
              </SingleTableItem>
              <SingleTableItem>{product.sell_price}</SingleTableItem>
              <SingleTableItem>{product.warehouse_position}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
}

export default EditCustomerPage;