import { collection, getDocs, query } from '@firebase/firestore';
import { db } from 'firebase';
import { addDoc, and, or, where } from 'firebase/firestore';
import { FormEvent, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { Customer } from 'renderer/interfaces/Customer';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

const newCustomerInitialState = {
  name: '',
  address: '',
  phone_number: '',
  special_price_products: [],
} as Customer;

function InputCustomerPage() {
  const navigate = useNavigate();
  const [newCustomer, setNewCustomer] = useState<Customer>(
    newCustomerInitialState
  );
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  function handleSubmit(e: FormEvent) {
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

    if (newCustomer.special_price_products.some((sp) => sp.price === '')) {
      setErrorMessage('Please enter prices for all selected products');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    console.log(newCustomer);

    // Make a code to input my data to firebase
    const productCollection = collection(db, '/customer');
    setLoading(true);
    addDoc(productCollection, newCustomer)
      .then(() => {
        setLoading(false);
        navigate(-1);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        setLoading(false);
      });
  }

  const handleSearch = async (search: string) => {
    const productsQuery = query(
      collection(db, 'product'),
      or(
        // Query as-is:
        and(
          where('brand', '>=', search),
          where('brand', '<=', search + '\uf8ff')
        ),
        // Capitalize first letter:
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
        // Lowercase:
        and(
          where('brand', '>=', search.toLowerCase()),
          where('brand', '<=', search.toLowerCase() + '\uf8ff')
        )
      )
    );
    const querySnapshot = await getDocs(productsQuery);

    const productData: Product[] = [];
    querySnapshot.forEach((theProduct) => {
      const data = theProduct.data() as Product;
      data.id = theProduct.id;
      data.sell_price = theProduct.get('sell_price') as string;
      productData.push(data);
    });

    setProducts(productData);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Add New Customer
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
                <div className="w-full flex justify-between items-center">
                  <div className="w-4/5">
                    <label htmlFor="price" className="text-md">
                      {product.brand +
                        ' ' +
                        product.motor_type +
                        ' ' +
                        product.part +
                        ' ' +
                        product.available_color}
                    </label>
                  </div>
                  <div className="w-1/5">
                    <input
                      disabled={loading}
                      id={'price'}
                      name={'price'}
                      type="text"
                      className={`placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full
                      `}
                      value={
                        newCustomer.special_price_products.find(
                          (sp) => sp.product === product.id
                        )?.price ?? product.sell_price
                      }
                      onChange={(e) => {
                        const newSpecialPriceProducts = [
                          ...newCustomer.special_price_products,
                        ];
                        const index = newSpecialPriceProducts.findIndex(
                          (sp) => sp.product === product.id
                        );
                        newSpecialPriceProducts[index].price = e.target.value;
                        setNewCustomer(() => {
                          return {
                            ...newCustomer,
                            special_price_products: newSpecialPriceProducts,
                          };
                        });
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border:none hover:text-red-900 focus:z-10 focus:ring-4 focus:ring-gray-200"
                  onClick={() => {
                    setSelectedProducts(
                      selectedProducts.filter((p) => p !== product)
                    );
                    if (product.id)
                      newCustomer.special_price_products =
                        newCustomer.special_price_products.filter(
                          (sp) => sp.product !== product.id
                        );
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
                if (!selectedProducts.includes(product)) {
                  setSelectedProducts([...selectedProducts, product]);
                  if (product.id)
                    newCustomer.special_price_products = [
                      ...newCustomer.special_price_products,
                      {
                        product: product.id,
                        price: product.sell_price,
                      },
                    ];
                } else {
                  setSelectedProducts(
                    selectedProducts.filter((p) => p !== product)
                  );
                  if (product.id)
                    newCustomer.special_price_products =
                      newCustomer.special_price_products.filter(
                        (sp) => sp.product !== product.id
                      );
                }
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product)}
                  readOnly
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

export default InputCustomerPage;
