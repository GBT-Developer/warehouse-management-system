import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from 'renderer/components/AuthCard';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

export const CreateAdminPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { register } = useAuth().actions;

  return (
    <PageLayout>
      <AuthCard>
        <div className="flex flex-col gap-[0.5rem]">
          <form
            className="flex flex-col gap-[0.5rem]"
            onSubmit={(e) => {
              e.preventDefault();
              register({ email, password })
                .then((e) => {
                  console.log(e);
                })
                .catch(() => console.log('error creating user'));
            }}
          >
            <input
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="••••••••"
              name="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
            >
              Create User
            </button>
          </form>
          <button
            type="button"
            onClick={() => navigate('/adminlistpage')}
            className="py-2 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
          >
            Cancel
          </button>
        </div>
      </AuthCard>
    </PageLayout>
  );
};
