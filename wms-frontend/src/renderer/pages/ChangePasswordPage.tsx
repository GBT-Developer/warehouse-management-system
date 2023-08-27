import { auth } from 'firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { AuthCard } from 'renderer/components/AuthCard';
import { PageLayout } from 'renderer/layout/PageLayout';

export const ChangePasswordPage = () => {
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      return;
    }
    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email!, password)
      );
      if (newPassword === confirmNewPassword) {
        await updatePassword(user, newPassword);
      } else {
        throw new Error('Passwords do not match');
      }
      setSuccess(true);
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const errString = (err as Error).message as string;
      setError(errString.replace('Firebase:', '').replace('auth/', ''));
      setTimeout(() => {
        setError('');
      }, 3000);
      setSuccess(false);
    }
  };

  return (
    <PageLayout>
      <AuthCard>
        <div className="changePassword">
          <form className="flex flex-col gap-[0.5rem]" onSubmit={handleSubmit}>
            <h1 className="text-xl font-medium text-gray-900">
              Change Password
            </h1>
            <input
              type="password"
              placeholder="Current Password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Submit
            </button>
            {success && ( // Display success message conditionally
              <div className="text-green-500 text-sm mt-2">
                Password changed successfully!
              </div>
            )}
            {error !== '' && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </div>
      </AuthCard>
    </PageLayout>
  );
};
