import { db } from 'firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { StockInputField } from 'renderer/components/StockInputField';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newSupplierInitialState = {
  company_name: '',
  address: '',
  city: '',
  phone_number: '',
  bank_number: '',
  bank_owner: '',
} as Supplier;

function InputSupplier() {
  const navigate = useNavigate();
  const [newSupplier, setNewSupplier] = useState<Supplier>(
    newSupplierInitialState
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // If one or more fields are empty, return early
    if (
      Object.values(newSupplier).some(
        (value) => value === '' || value === undefined
      ) ||
      newSupplier === newSupplierInitialState
    ) {
      setErrorMessage('Mohon isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Check data type
    if (
      Number.isNaN(Number(newSupplier.bank_number)) ||
      Number.isNaN(Number(newSupplier.phone_number))
    ) {
      setErrorMessage('Nomor telepon atau nomor rekening tidak valid');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Make a code to input my data to firebase
    const productCollection = collection(db, '/supplier');
    setLoading(true);
    addDoc(productCollection, newSupplier)
      .then(() => {
        setNewSupplier(newSupplierInitialState);
        setLoading(false);
        // Set the select value back to default
      })
      .catch((error) => {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log(error);
      });
  }
  return (
    <PageLayout>
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
        Input Supplier
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
            label="Company Name"
            labelFor="company_name"
            value={newSupplier.company_name}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, company_name: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Address"
            labelFor="address"
            value={newSupplier.address}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, address: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="City"
            labelFor="city"
            value={newSupplier.city}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, city: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Phone Number"
            labelFor="phone_number"
            value={newSupplier.phone_number}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, phone_number: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Bank Number"
            labelFor="bank_number"
            value={newSupplier.bank_number}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, bank_number: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Bank Owner"
            labelFor="bank_owner"
            value={newSupplier.bank_owner}
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, bank_owner: e.target.value })
            }
          />
        </div>
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
}

export default InputSupplier;
