import { db } from 'firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiFillEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { useNavigate, useParams } from 'react-router-dom';
import { AreaField } from 'renderer/components/AreaField';
import { InputField } from 'renderer/components/InputField';
import { Supplier } from 'renderer/interfaces/Supplier';
import { PageLayout } from 'renderer/layout/PageLayout';
export default function SupplierDetailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const [supplier, setSupplier] = useState<Supplier>();
  const [editToggle, setEditToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage('Harga atau jumlah barang tidak valid');
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
      console.error('Error updating document: ', error);
    });

    setLoading(false);
    setEditToggle(false);
  }
  return (
    <PageLayout>
      <div className="flex justify-between w-2/3">
        <h1 className="mb-[4rem] text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Supplier Detail
        </h1>
        <button
          type="button"
          className="px-4 py-2 font-medium text-white bg-gray-600  focus:ring-4 focus:ring-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
          onClick={() => setEditToggle(!editToggle)}
        >
          {editToggle ? (
            <>
              Cancel
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
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}
            <InputField
              loading={loading || !editToggle}
              labelFor="company_name"
              label="Company Name"
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
              label="Address"
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
              label="City"
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
              label="Contact Number"
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
              label="Contact Person"
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
              label="Bank Number"
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
              label="Bank Owner"
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
              label="Remarks"
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
            <div className="flex gap-2 w-full justify-between">
              <button
                type="button"
                className="px-4 py-2 font-medium text-white bg-gray-600  focus:ring-4 focus:ring-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              {editToggle && (
                <button
                  disabled={loading}
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </div>
    </PageLayout>
  );
}
