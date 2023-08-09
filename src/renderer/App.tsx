import { MemoryRouter as Router } from 'react-router-dom';
import './App.css';
import { AppRoutes } from './AppRoutes';

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
