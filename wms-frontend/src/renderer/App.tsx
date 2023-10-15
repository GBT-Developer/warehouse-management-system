import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { auth } from './firebase';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
  // If app is closed, then logout
  useEffect(() => {
    const logout = () => {
      auth.signOut();
    };

    window.addEventListener('beforeunload', logout);

    return () => {
      window.removeEventListener('beforeunload', logout);
    };
  }, []);

  return (
    <MemoryRouter>
      <AuthProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AuthProvider>
    </MemoryRouter>
  );
}
