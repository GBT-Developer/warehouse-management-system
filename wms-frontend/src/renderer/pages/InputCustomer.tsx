import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { InputField } from 'renderer/components/InputField';
import ListModal from 'renderer/components/TableComponents/ListModal';
import { Customer } from 'renderer/interfaces/Customer';
import { SpecialPrice } from 'renderer/interfaces/SpecialPrice';
import { PageLayout } from 'renderer/layout/PageLayout';

const newCustomerInitialState = {
  name: '',
  address: '',
  phone_number: '',
  SpecialPrice: [],
} as Customer;

const newSpecialPriceInitialState = {
  product_id: '',
  product_name: '',
  price: 0,
} as SpecialPrice;

function InputCustomerPage() {
  const navigate = useNavigate();
  const [newCustomer, setNewCustomer] = useState<Customer>(
    newCustomerInitialState
  );
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectionConfirmed = (selectedProducts: string[]) => {
    setSelectedProducts(selectedProducts);
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
        <button
          type="button"
          className="text-white bg-blue-700 text-center font-medium text-sm rounded-lg px-5 py-2-5"
          onClick={() => setShowModal(true)}
        >
          Select Products
        </button>

        <h2 className="text-2xl font-bold">Special Price</h2>

        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
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
      <ListModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectionConfirmed={handleSelectionConfirmed}
      >
        <div>
          <h1 className="text-2xl font-bold">Special Price</h1>
        </div>
      </ListModal>
    </PageLayout>
  );
}

export default InputCustomerPage;
