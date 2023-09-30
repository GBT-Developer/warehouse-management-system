import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { db } from 'renderer/firebase';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
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

function InputSupplier() {
  const navigate = useNavigate();
  const [newSupplier, setNewSupplier] = useState<Supplier>(
    newSupplierInitialState
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successNotify = () =>
    toast.success('Supplier baru berhasil ditambahkan');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Supplier baru gagal ditambahkan');
  const [isEmpty, setIsEmpty] = useState(false);

  //check all of the input empty or not
  useEffect(() => {
    if (
      newSupplier.company_name === '' &&
      newSupplier.address === '' &&
      newSupplier.city === '' &&
      newSupplier.phone_number === '' &&
      newSupplier.contact_person === '' &&
      newSupplier.bank_owner === '' &&
      newSupplier.bank_number === ''
    ) {
      setIsEmpty(true);
      return;
    } else if (
      newSupplier.company_name != '' &&
      newSupplier.address != '' &&
      newSupplier.city != '' &&
      newSupplier.phone_number != '' &&
      newSupplier.contact_person != '' &&
      newSupplier.bank_owner != '' &&
      newSupplier.bank_number != ''
    ) {
      setIsEmpty(false);
      return;
    }
  }, [newSupplier]);

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // If one or more fields are empty except remarks, return early
    if (
      !newSupplier.company_name ||
      !newSupplier.address ||
      !newSupplier.city ||
      !newSupplier.phone_number ||
      !newSupplier.bank_number ||
      !newSupplier.contact_person
    ) {
      setErrorMessage('Tolong isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    setIsEmpty(false);
    // Check data type
    if (
      Number.isNaN(Number(newSupplier.bank_number)) ||
      Number.isNaN(Number(newSupplier.phone_number))
    ) {
      setErrorMessage('Nomor telepon dan nomor rekening harus angka');
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
        successNotify();
        // Set the select value back to default
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage = error as unknown as string;
        failNotify(errorMessage);
      });
  }
  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Supplier Baru
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
          placeholder="Phone number or landline number"
          onChange={(e) =>
            setNewSupplier({ ...newSupplier, phone_number: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Kontak Person"
          labelFor="contact_person"
          value={newSupplier.contact_person}
          placeholder="i.e John Doe"
          onChange={(e) =>
            setNewSupplier({ ...newSupplier, contact_person: e.target.value })
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
          label="Atas Nama"
          labelFor="bank_owner"
          value={newSupplier.bank_owner}
          placeholder="i.e John Doe"
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
        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
          >
            Add New
          </button>

          <button
            disabled={loading}
            type="button"
            className="py-2 px-5 text-sm font-medium text-gray-500 focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-200  focus:z-10 focus:ring-4 focus:ring-gray-300"
            onClick={() => navigate(-1)}
          >
            Cancel
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
}

export default InputSupplier;
