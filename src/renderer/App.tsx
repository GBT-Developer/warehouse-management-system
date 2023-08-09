import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { auth } from 'firebase';
import { signInAnonymously } from 'firebase/auth';

function Hello() {
  return (
    <div>
      <h1 className="text-blue-400 text-5xl">Hello World!</h1>
      <button
        type="button"
        className="bg-gray-300 text-black p-2 rounded-lg shadow-md hover:bg-gray-400"
        onClick={() => {
          signInAnonymously(auth);
        }}
      >
        Click me
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
