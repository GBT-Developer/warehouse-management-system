import { doc, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useRef, useState } from 'react';
import { AiFillEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { db, storage } from 'renderer/firebase';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export default function CompanyDetail() {
  const [loading, setLoading] = useState(false);
  const { companyInfo } = useAuth();
  const { setCurrentCompanyInfo } = useAuth().actions;
  const [editedCompanyInfo, setEditedCompanyInfo] = useState<CompanyInfo>(
    companyInfo ?? {
      name: '',
      address: '',
      phone_number: '',
      logo: '',
    }
  );
  const [editToggle, setEditToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const successNotify = () =>
    toast.success('Detail perusahaan berhasil diubah');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Detail perusahaan gagal diubah');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // If one or more fields are empty, return early
    if (!editedCompanyInfo) return;
    if (
      Object.values(editedCompanyInfo).some(
        (value) => value === '' || value === undefined
      )
    ) {
      failNotify('Mohon isi semua kolom');
      return;
    }

    if (Number.isNaN(Number(editedCompanyInfo.phone_number))) {
      failNotify('Mohon isi nomor telepon dengan benar');
      return;
    }

    setLoading(true);

    // Uploading image to firebase storage
    const imagePath = `company_info/company_logo`;
    if (imageInputRef.current?.files?.[0]) {
      const imageObject = imageInputRef.current.files[0];
      const storageRef = ref(storage, imagePath);
      const uploadTask = uploadBytes(storageRef, imageObject);

      uploadTask.catch(() => {
        failNotify();
      });
    }

    const companyInfoRef = doc(db, 'company_info', 'my_company');
    const updatedCompanyInfo = {
      ...editedCompanyInfo,
    };

    await runTransaction(db, async (transaction) => {
      transaction.set(companyInfoRef, {
        ...updatedCompanyInfo,
        logo: imagePath,
      });
    }).catch((error) => {
      failNotify();
    });

    setCurrentCompanyInfo(updatedCompanyInfo);

    setLoading(false);
    successNotify();
    setEditToggle(false);
  };

  return (
    <PageLayout>
      <div className="flex w-2/3 flex-col mb-[2rem]">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4">
          <div className="flex w-2/3 flex-col md:flex-row">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Detail Perusahaan
            </h1>
          </div>
          <button
            type="button"
            className="px-4 py-2 font-medium text-black bg-white border border-gray-300 rounded-lg text-sm h-[max-content] w-[max-content] flex justify-center gap-2 text-center items-center"
            onClick={() => setEditToggle(!editToggle)}
          >
            {editToggle ? (
              <>
                Cancel
                <GiCancel />
              </>
            ) : (
              <>
                Edit
                <AiFillEdit />
              </>
            )}
          </button>
        </div>
        <p>Informasi detail perusahaan yang akan ditampilkan di invoice</p>
      </div>

      <div className="w-full h-full bg-transparent">
        <div className="relative sm:rounded-lg h-full flex flex-col justify-between">
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
            <div className="w-full flex justify-between items-center">
              <div className="w-1/3">
                <label htmlFor={'logo'} className="text-md">
                  Logo Perusahaan
                </label>
              </div>
              <div className="w-2/3">
                <input
                  ref={imageInputRef}
                  hidden
                  id={'logo'}
                  name={'logo'}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (editedCompanyInfo === undefined) return;
                    const imageObject = e.target.files?.[0];
                    if (!imageObject) return;
                    setEditedCompanyInfo({
                      ...editedCompanyInfo,
                      logo: URL.createObjectURL(imageObject),
                    });
                  }}
                />
                {/* Image previewer */}
                <div className="w-full relative flex justify-start">
                  {editToggle && (
                    <div
                      className="flex items-center text-center justify-center cursor-pointer absolute top-0 left-0 w-1/3 h-full bg-gray-50 bg-opacity-90"
                      onClick={() => {
                        if (imageInputRef.current) {
                          imageInputRef.current.click();
                        }
                      }}
                    >
                      Ganti logo
                    </div>
                  )}
                  <img
                    src={editedCompanyInfo?.logo ?? ''}
                    alt="logo"
                    className="w-1/3"
                  />
                </div>
              </div>
            </div>
            <InputField
              loading={loading || !editToggle}
              labelFor="name"
              label="Nama Perusahaan"
              value={editedCompanyInfo?.name ?? ''}
              onChange={(e) => {
                if (editedCompanyInfo === undefined) return;
                setEditedCompanyInfo({
                  ...editedCompanyInfo,
                  name: e.target.value,
                });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="address"
              label="Alamat"
              value={editedCompanyInfo?.address ?? ''}
              onChange={(e) => {
                if (editedCompanyInfo === undefined) return;
                setEditedCompanyInfo({
                  ...editedCompanyInfo,
                  address: e.target.value,
                });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <InputField
              loading={loading || !editToggle}
              labelFor="phone_number"
              label="Nomor Telepon"
              value={editedCompanyInfo?.phone_number ?? ''}
              onChange={(e) => {
                if (editedCompanyInfo === undefined) return;
                setEditedCompanyInfo({
                  ...editedCompanyInfo,
                  phone_number: e.target.value,
                });
              }}
              additionalStyle={`${
                editToggle ? '' : 'border-none outline-none bg-inherit'
              }`}
            />
            <div className="flex gap-2 w-full justify-end mt-4">
              {editToggle && (
                <button
                  disabled={loading}
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
                >
                  Simpan Perubahan
                </button>
              )}
            </div>
          </form>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </div>
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
