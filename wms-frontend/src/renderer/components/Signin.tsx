import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from 'renderer/providers/AuthProvider';

const defaultFormFields = {
  email: '',
  password: '',
};

export const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth().actions;
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [error, setError] = useState('');

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password } = formFields;

    try {
      const res = await login({ email, password });

      if (!res) {
        throw new Error('Failed logging in');
      }

      resetFormFields();
      navigate('/profile');
    } catch (err) {
      const errString = (err as Error).message as string;
      setError(errString);
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700">
        <form className="gap-y-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Sign in
          </h3>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300"
            >
              Your email
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@company.com"
                required
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
              className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300"
            >
              Your password
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
                onChange={(event) => {
                  setFormFields({
                    ...formFields,
                    password: event.target.value,
                  });
                }}
              />
            </label>
          </div>
          <div className="flex items-start">
            <a
              className="text-sm text-blue-700 hover:underline ml-auto dark:text-blue-500"
              href="https://google.com"
            >
              Lost Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Login to your account
          </button>
          {error !== '' && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};