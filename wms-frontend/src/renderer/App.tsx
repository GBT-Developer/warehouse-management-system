import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
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
