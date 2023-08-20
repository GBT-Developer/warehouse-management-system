import React, { useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from 'firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CustomUser } from 'renderer/interfaces/CustomUser';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type LoginData = {
  password: string;
  email: string;
};

export type AuthContext = {
  accessToken: string | null;
  user: CustomUser | null;
  isLoggedIn: boolean;
  actions: {
    login: (loginData: LoginData) => Promise<UserCredential | void>;
    logout: () => void;
  };
};

export const initialAuthContext = {
  accessToken: null,
  user: null,
  isLoggedIn: false,
  actions: {
    login: () => Promise.resolve(),
    logout: () => undefined,
  },
};

export const authContext = React.createContext<AuthContext | null>(
  initialAuthContext
);

export type AuthProviderProps = { children: React.ReactNode };
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useLocalStorage<string | null>(
    'accessToken',
    null
  );
  const [user, setUser] = React.useState<CustomUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      if (newUser) {
        const docRef = doc(db, '/users', newUser.uid);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as CustomUser);
        } else {
          signOut(auth).catch(() => {
            // TODO: Handle error
          });
          throw new Error('CustomUser not found');
        }

        newUser
          .getIdToken()
          .then((newToken) => {
            setAccessToken(newToken);
          })
          .catch(() => {
            // TODO: Handle error
          });
      } else {
        setAccessToken(null); // To be changed to a toast
        setUser(null);
        navigate('/');
      }
    });

    return unsubscribe;
  }, []);

  const onLogout = React.useCallback(() => {
    signOut(auth).catch(() => {
      // TODO: Handle error
    });
  }, []);

  const onLogin = React.useCallback(async (loginData: LoginData) => {
    if (!loginData.email || !loginData.password) {
      return;
    }

    try {
      const signInRes = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      ).catch(() => {
        // TODO: Handle error
      });

      return signInRes;
    } catch (error) {
      // TODO: Handle error
    }
  }, []);

  const authValue = useMemo(
    () => ({
      accessToken,
      user,
      isLoggedIn: !!user,
      actions: {
        login: onLogin,
        logout: onLogout,
      },
    }),
    [accessToken, user, onLogin, onLogout]
  );

  return (
    <authContext.Provider value={authValue}>{children}</authContext.Provider>
  );
};

export const useAuth = () => {
  const contextValue = useContext(authContext);
  if (!contextValue) {
    throw new Error('ensure to use useAuth within its provider');
  }
  return contextValue;
};
