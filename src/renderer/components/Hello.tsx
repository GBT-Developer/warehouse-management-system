import { useNavigate } from 'react-router-dom';
import '../App.css';
import { auth, db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';

export function Hello() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-blue-400 text-5xl">Hello World!</h1>
      <button
        type="button"
        className="bg-gray-300 text-black p-2 rounded-lg shadow-md hover:bg-gray-400"
        onClick={async () => {
          // Retrieve a reference to a collection in the database
          const userCollection = collection(db, '/user');
          const q = query(userCollection);
          const docRef = await getDocs(q);
          docRef.forEach((dok) => {
            // eslint-disable-next-line no-console
            console.log(dok.get('username'));
          });
          navigate('/homepage');
        }}
      >
        Click me
      </button>
      <button
        type="button"
        className="bg-gray-300 text-black p-2 rounded-lg shadow-md hover:bg-gray-400"
        onClick={() => {
          const provider = new GoogleAuthProvider();
          signInWithRedirect(auth, provider)
            .then((result) => {
              // eslint-disable-next-line no-console
              console.log(result);
              return result;
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.log(error);
            });
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
