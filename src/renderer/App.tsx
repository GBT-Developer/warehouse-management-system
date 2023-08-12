import { MemoryRouter as Router } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
