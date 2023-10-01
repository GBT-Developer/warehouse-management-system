import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { CustomUser } from 'renderer/interfaces/CustomUser';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

const initNewAdmin: CustomUser = {
  display_name: '',
  email: '',
  role: '',
};

export const CreateAdminPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState<CustomUser>(initNewAdmin);
  const [errorMessage, setErrorMessage] = useState('');
  const successNotify = () => toast.success('Admin successfully created');
  const { register } = useAuth().actions;
  const [isEmpty, setIsEmpty] = useState(false);

  // Check input field
  useEffect(() => {
    if (
      newAdmin.display_name === '' ||
      newAdmin.email === '' ||
      newAdmin.role === '' ||
      password === ''
    ) {
      setIsEmpty(true);
      return;
    } else {
      setIsEmpty(false);
      return;
    }
  }, [newAdmin, password]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    register({
      email: newAdmin.email,
      password: password,
      display_name: newAdmin.display_name,
      role: newAdmin.role,
    })
      .then((res) => {
        if (res) {
          successNotify();
          setNewAdmin(initNewAdmin);
          setPassword('');
          //unchecked radio button
          const radioBtn = document.querySelectorAll(
            'input[type="radio"]'
          ) as NodeListOf<HTMLInputElement>;
          radioBtn.forEach((btn) => {
            btn.checked = false;
          });
        }
      })
      .catch((err) => {
        const errMessage = err as string;
        setErrorMessage(errMessage);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      });
    setLoading(false);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl pt-4">
        Add New Admin
      </h1>
      <form
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
        onSubmit={(e) => handleSubmit(e)}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <InputField
          loading={loading}
          label="Display Name"
          labelFor="display_name"
          value={newAdmin.display_name}
          placeholder="i.e. John Doe"
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, display_name: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Email"
          labelFor="email"
          value={newAdmin.email}
          placeholder="i.e. admin@gmail.com"
          onChange={(e) => {
            setNewAdmin({ ...newAdmin, email: e.target.value });
          }}
        />
        <InputField
          type="password"
          loading={loading}
          label="Password"
          labelFor="password"
          value={password}
          placeholder="••••••"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex flex-row items-center py-1">
          <label htmlFor="role" className="text-md w-1/3">
            Role
          </label>
          <div className="w-2/3 flex flex-row gap-8">
            <div className="flex flex-row items-center gap-1">
              <input
                type="radio"
                name="role"
                id="gudang-bahan"
                value="Gudang Bahan"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                onChange={(e) => {
                  setNewAdmin({ ...newAdmin, role: e.target.value });
                }}
              />
              <label
                htmlFor="gudang-bahan"
                className="text-sm font-medium cursor-pointer"
              >
                Gudang Bahan
              </label>
            </div>
            <div className="flex flex-row items-center gap-1">
              <input
                type="radio"
                name="role"
                id="gudang-jadi"
                value="Gudang Jadi"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                onChange={(e) => {
                  setNewAdmin({ ...newAdmin, role: e.target.value });
                }}
              />
              <label
                htmlFor="gudang-jadi"
                className="text-sm font-medium cursor-pointer"
              >
                Gudang Jadi
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
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
};
