import { db } from 'firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { AreaField } from 'renderer/components/AreaField';
import { StockInputField } from 'renderer/components/StockInputField';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';

const newSupplierInitialState = {
  company_name: '',
  address: '',
  city: '',
  phone_number: '',
  bank_number: '',
  remarks: '',
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
    // If one or more fields are empty except remarks, return early
    if (
      !newSupplier.company_name ||
      !newSupplier.address ||
      !newSupplier.city ||
      !newSupplier.phone_number ||
      !newSupplier.bank_number
    ) {
      setErrorMessage('Please fill all the fields');
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
      setErrorMessage('Please input a valid number');
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
        navigate(-1);
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
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Add New Supplier
      </h1>
      <form
        onSubmit={handleSubmit}
        className={`w-full py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <div className="grid gap-3 w-2/3">
          <StockInputField
            loading={loading}
            label="Company Name"
            labelFor="company_name"
            value={newSupplier.company_name}
            placeholder="i.e. PT. Berkat Abadi"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, company_name: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Address"
            labelFor="address"
            value={newSupplier.address}
            placeholder="i.e. Jl.Soekarno-Hatta No. 123"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, address: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="City"
            labelFor="city"
            value={newSupplier.city}
            placeholder="i.e. 10120, Jakarta"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, city: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Contact Number"
            labelFor="phone_number"
            value={newSupplier.phone_number}
            placeholder="Phone number or landline number"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, phone_number: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Contact Person"
            labelFor="contact_person"
            value={newSupplier.contact_person}
            placeholder="i.e John Doe"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, contact_person: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Bank Number"
            labelFor="bank_number"
            value={newSupplier.bank_number}
            placeholder="1234567890"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, bank_number: e.target.value })
            }
          />
          <StockInputField
            loading={loading}
            label="Bank Owner"
            labelFor="bank_owner"
            value={newSupplier.bank_owner}
            placeholder="i.e John Doe"
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
            value={newSupplier.remarks}
            placeholder="Additional info... (max. 300 characters)"
            onChange={(e) =>
              setNewSupplier({ ...newSupplier, remarks: e.target.value })
            }
          />
        </div>
        <div className="flex flex-row-reverse gap-2 w-2/3 justify-start">
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
    </PageLayout>
  );
}

export default InputSupplier;
