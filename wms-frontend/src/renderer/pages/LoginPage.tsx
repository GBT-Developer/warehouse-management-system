import { FormEvent, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageLayout } from 'renderer/layout/PageLayout';
import { AuthCard } from '../components/AuthCard';
import { useAuth } from '../providers/AuthProvider';

const defaultFormFields = {
  email: '',
  password: '',
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth().actions;
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [loading, setLoading] = useState(false);
  const failNotify = (e?: string) => toast.error(e ?? 'Gagal login');

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password } = formFields;

    try {
      setLoading(true);
      const res = await login({ email, password });

      if (!res) {
        throw new Error('Failed logging in');
      }

      setLoading(false);
      resetFormFields();
      navigate('/profile');
    } catch (err) {
      const errString = (err as Error).message as string;
      failNotify(errString);
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <AuthCard>
        <form className="flex flex-col gap-[0.5rem]" onSubmit={handleSubmit}>
          <h3 className="text-xl font-medium text-gray-900">Sign in</h3>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900 block mb-2"
            >
              Email Anda
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="name@company.com"
                required
                disabled={loading}
                onChange={(event) => {
                  setFormFields({
                    ...formFields,
                    email: event.target.value,
                  });
                }}
              />
            </label>
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-900 block mb-2"
            >
              Password Anda
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
                disabled={loading}
                onChange={(event) => {
                  setFormFields({
                    ...formFields,
                    password: event.target.value,
                  });
                }}
              />
            </label>
          </div>
          <a
            className="text-sm text-blue-700 hover:underline ml-auto"
            href="https://google.com"
          >
            Lupa Password?
          </a>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex justify-center"
          >
            {loading ? (
              <p>
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center" />
              </p>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </AuthCard>
    </PageLayout>
  );
};
