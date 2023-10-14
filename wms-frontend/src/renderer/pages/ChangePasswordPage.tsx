import { FirebaseError } from 'firebase/app';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthCard } from 'renderer/components/AuthCard';
import { auth } from 'renderer/firebase';
import { PageLayout } from 'renderer/layout/PageLayout';
export const ChangePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (password === '' || newPassword === '' || confirmNewPassword === '') {
      setIsEmpty(true);
      return;
    } else {
      setIsEmpty(false);
      return;
    }
  }, [password, newPassword, confirmNewPassword]);

  const successNotify = () =>
    toast.success('Password berhasil diubah', {
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
    toast.error(e ?? 'Password gagal diubah', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email!, password)
      );
      if (newPassword === confirmNewPassword)
        await updatePassword(user, newPassword);
      else throw new Error('Password tidak sesuai');

      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      successNotify();
    } catch (err) {
      const error = err as unknown as FirebaseError;
      let errMessage = '';
      switch (error.code) {
        case 'auth/invalid-email':
          errMessage = 'Email tidak valid';
          break;
        case 'auth/user-disabled':
          errMessage = 'User nonaktif';
          break;
        case 'auth/user-not-found':
          errMessage = 'User tidak ditemukan';
          break;
        case 'auth/wrong-password':
          errMessage = 'Password salah';
          break;
        default:
          errMessage = 'Terjadi kesalahan di sistem';
          break;
      }
      failNotify(errMessage);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-full mt-[-2.5rem]">
        <AuthCard>
          <div className="changePassword">
            <form
              className="flex flex-col gap-[0.5rem]"
              onSubmit={handleSubmit}
            >
              <h1 className="text-xl font-medium text-gray-900">
                Ubah Password
              </h1>
              <input
                type="password"
                placeholder="Password Sekarang"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password Baru"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                required
              />
              <button
                disabled={isEmpty}
                type="submit"
                style={{
                  backgroundColor: isEmpty ? 'gray' : 'blue',
                  // Add other styles as needed
                }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Konfirmasi
              </button>
            </form>
          </div>
        </AuthCard>
      </div>
    </PageLayout>
  );
};
