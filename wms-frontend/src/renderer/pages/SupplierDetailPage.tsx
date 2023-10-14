import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiFillEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { db } from 'renderer/firebase';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
export default function SupplierDetailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [supplier, setSupplier] = useState<Supplier>();
  const [editToggle, setEditToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const successNotify = () =>
    toast.success('Data supplier berhasil diperbarui', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Data supplier gagal diperbarui', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (param.id === undefined) return;
        const supplierRef = doc(db, 'supplier', param.id);
        const theSupplier = await getDoc(supplierRef);
        const data = theSupplier.data() as Supplier;
        data.id = theSupplier.id;
        setSupplier(data);

        setLoading(false);
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
    // If one or more fields are empty except remarks, return
    if (!supplier) return;
    if (
      !supplier.company_name ||
      !supplier.address ||
      !supplier.city ||
      !supplier.phone_number ||
      !supplier.contact_person ||
      !supplier.bank_number ||
      !supplier.bank_owner
    ) {
      setErrorMessage('Mohon isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (
      Number.isNaN(Number(supplier.bank_number)) ||
      Number.isNaN(Number(supplier.phone_number))
    ) {
      setErrorMessage('Harga atau nomor rekening tidak valid');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (!supplier.id) return;
    const supplierRef = doc(db, 'supplier', supplier.id);
    const updatedSupplier = {
      ...supplier,
      address: supplier.address,
      bank_number: supplier.bank_number,
      bank_owner: supplier.bank_owner,
      city: supplier.city,
      company_name: supplier.company_name,
      phone_number: supplier.phone_number,
      contact_person: supplier.contact_person,
      remarks: supplier.remarks ?? '',
    };
    setLoading(true);

    updateDoc(supplierRef, updatedSupplier).catch((error) => {
      setLoading(false);
      const errorMessage = error as unknown as string;
      failNotify(errorMessage);
    });
    successNotify();
    setLoading(false);
    setEditToggle(false);
  }

  const handleDeleteSupplier = async () => {
    if (!supplier || !supplier.id) return;

    const supplierRef = doc(db, 'supplier', supplier.id);
    setLoading(true);
    try {
      await deleteDoc(supplierRef);
      navigate(-1);
    } catch (error) {
      console.log(error);
      failNotify(error as unknown as string);
    }
    setLoading(false);
  };

  return (
    <PageLayout>
      <div className="flex w-2/3 flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]">
        <div className="flex w-2/3 flex-col md:flex-row">
          <button
            type="button"
            className="pr-6 font-2xl  text-gray-600 focus:ring-4 focus:ring-gray-300 rounded-lg text-sm w-[max-content] flex justify-center gap-2 text-center items-center"
            onClick={() => navigate(-1)}
          >
            <IoChevronBackOutline size={40} /> {/* Icon */}
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Detail Supplier
          </h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 font-medium text-black bg-white border border-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
          onClick={() => setEditToggle(!editToggle)}
        >
          {editToggle ? (
            <>
              Batal
              <GiCancel />
            </>
          ) : (
            <>
              Edit Supplier
              <AiFillEdit />
            </>
          )}
        </button>
      </div>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <form
            onSubmit={handleSubmit}
            className={`w-2/3 flex flex-col gap-3 relative ${
              loading ? 'p-2' : ''
            } transform transition-all duration-300`}
          >
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <InputField
              loading={loading || !editToggle}
              labelFor="company_name"
              label="Nama Perusahaan"
              value={supplier?.company_name ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, company_name: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="address"
              label="Alamat"
              value={supplier?.address ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, address: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="city"
              label="Kota"
              value={supplier?.city ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, city: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="phone_number"
              label="Nomor Telepon"
              value={supplier?.phone_number ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, phone_number: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="contact_person"
              label="Narahubung"
              value={supplier?.contact_person ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, contact_person: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="bank_number"
              label="Nomor Rekening"
              value={supplier?.bank_number ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, bank_number: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="bank_owner"
              label="Atas Nama"
              value={supplier?.bank_owner ?? ''}
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, bank_owner: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <AreaField
              loading={loading || !editToggle}
              label="Catatan"
              labelFor="remarks"
              maxLength={300}
              rows={7}
              value={supplier?.remarks ? supplier.remarks : '-'}
              placeholder="Additional info... (max. 300 characters)"
              onChange={(e) => {
                if (supplier === undefined) return;
                setSupplier({ ...supplier, remarks: e.target.value });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <div className="flex gap-2 w-full justify-between mt-4">
              {editToggle && (
                <>
                  <div className="flex items-center">
                    <p
                      className="text-red-500 hover:text-red-600 cursor-pointer hover:underline text-sm"
                      onClick={() => setShowConfirmation(true)}
                    >
                      Hapus Supplier
                    </p>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
                  >
                    Simpan
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
        {showConfirmation && (
          <div
            className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 rounded-lg z-10 w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          >
            <div
              className="bg-white rounded-lg p-4 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg text-gray-900">
                Apakah anda yakin ingin menghapus supplier ini?
              </p>
              <div className="w-full flex justify-end mt-3">
                <div className="flex relative w-[fit-content] gap-3">
                  {loading && (
                    <p className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-sm z-50 bg-opacity-50">
                      <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-xl" />
                    </p>
                  )}
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Tidak
                  </button>
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSupplier();
                    }}
                  >
                    Ya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
