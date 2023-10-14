import { FirebaseError } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { CustomUser } from 'renderer/interfaces/CustomUser';
import { PageLayout } from 'renderer/layout/PageLayout';

export const AdminListPage = () => {
  const [search, setSearch] = useState('');
  const [adminList, setAdminList] = useState<CustomUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();
  const successNotify = () =>
    toast.success('Admin berhasil dihapus', {
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
    toast.error(e ?? 'Admin gagal dihapus', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState<CustomUser | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // Fetch all user in the collection user
      const userRef = collection(db, 'user');
      const q = query(userRef);
      const userSnapshot = await getDocs(q);

      const userData: CustomUser[] = [];
      userSnapshot.forEach((theUser) => {
        const data = theUser.data() as CustomUser;
        data.id = theUser.id;
        userData.push(data);
      });

      setAdminList(userData);
    };

    setLoading(true);

    fetchUser().catch((error) => {
      console.log(error);
    });

    setLoading(false);
  }, []);

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    adminId: string | undefined
  ) => {
    e.stopPropagation();
    if (!adminId) return;
    setLoading(true);
    if (!adminId) return;
    const purchaseRef = doc(db, 'user', adminId);
    setModalLoading(true);
    await deleteDoc(purchaseRef)
      .then(() => {
        setAdminList(adminList.filter((adminList) => adminList.id !== adminId));
        setModalLoading(false);
        setModalOpen(false);
        successNotify();
      })
      .catch((error: FirebaseError) => {
        failNotify(error.message);
        setModalLoading(false);
      });
    setConfirmed(false);
    setLoading(false);
  };

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              List Admin
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <div className="overflow-y-auto h-full">
              <table className="w-full text-sm text-left text-gray-500">
                <TableHeader>
                  <th className="py-3">Nama</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Peran</th>
                  <th className="py-3"></th>
                </TableHeader>
                <tbody>
                  {adminList
                    .filter((admin) => {
                      if (search === '') return admin;
                      else if (
                        admin.display_name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        admin.email.toLowerCase().includes(search.toLowerCase())
                      )
                        return admin;
                    })
                    .sort((a, b) => {
                      if (
                        a.display_name.toLowerCase() <
                        b.display_name.toLowerCase()
                      )
                        return -1;
                      if (
                        a.display_name.toLowerCase() >
                        b.display_name.toLowerCase()
                      )
                        return 1;
                      return 0;
                    })
                    .map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b hover:shadow-md cursor-pointer hover:underline"
                      >
                        <SingleTableItem>{admin.display_name}</SingleTableItem>
                        <SingleTableItem>{admin.email}</SingleTableItem>
                        <SingleTableItem>{admin.role}</SingleTableItem>
                        <SingleTableItem>
                          <button
                            type="button"
                            className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                            onClick={() => {
                              setActiveAdmin(() => admin);
                              setModalOpen(true);
                            }}
                          >
                            <BiSolidTrash />
                          </button>
                        </SingleTableItem>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div
                className={`fixed top-0 left-0 right-0 z-50 ${
                  modalOpen ? 'block' : 'hidden'
                } w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 flex justify-center items-center backdrop-filter backdrop-blur-sm`}
                onClick={() => setModalOpen(false)}
              >
                <div
                  className="relative bg-white rounded-lg shadow w-2/5 p-6 overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="w-full h-full bg-transparent rounded-lg overflow-hidden">
                    <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
                      <div className="overflow-y-auto h-full relative">
                        {modalLoading && (
                          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
                            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <div
                            className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                            role="alert"
                          >
                            <p className="text-center text-2xl font-bold">
                              Apakah anda yakin ingin menghapus admin ini?
                            </p>
                          </div>
                          <div className="flex">
                            <p className="w-2/5 font-bold">Nama:</p>
                            <p className="w-3/5">{activeAdmin?.display_name}</p>
                          </div>
                          <div className="flex">
                            <p className="w-2/5 font-bold">Email:</p>
                            <p className="w-3/5">{activeAdmin?.email}</p>
                          </div>
                          <div className="flex">
                            <p className="w-2/5 font-bold">Peran:</p>
                            <p className="w-3/5">{activeAdmin?.role}</p>
                          </div>
                          {confirmed && (
                            <div className="my-2 text-red-600 font-bold">
                              <p>
                                Jangan lupa hapus admin di firebase console!
                              </p>
                            </div>
                          )}
                          <div className="flex flex-row-reverse justify-start gap-2 mt-3">
                            <button
                              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                              onClick={(e) => {
                                if (!activeAdmin?.id) return;

                                if (confirmed) {
                                  handleDelete(e, activeAdmin.id);
                                } else setConfirmed(true);
                              }}
                            >
                              {<span>{confirmed ? 'Konfirm' : 'Hapus'}</span>}
                            </button>
                            <button
                              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                              onClick={() => {
                                setModalOpen(false);
                                setConfirmed(false);
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" absolute bottom-[2.5rem] right-[2.5rem]">
                <button
                  type="submit"
                  className=" text-blue-700 bg-white hover:bg-white  focus:ring-4 focus:ring-white font-medium rounded-lg text-lg px-10 py-3 focus:outline-none hover:-translate-y-1 shadow-md"
                  onClick={() => navigate('/createadminpage')}
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
