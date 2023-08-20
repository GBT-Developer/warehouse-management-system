import { MemoryRouter as Router } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { AppLayout } from './layout/AppLayout';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}
