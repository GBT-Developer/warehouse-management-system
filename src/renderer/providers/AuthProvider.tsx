import React, { useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from 'firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type LoginData = {
  password: string;
  email: string;
};

export type AuthContext = {
  accessToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  actions: {
    login: (loginData: LoginData) => Promise<User | void>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user
          .getIdToken()
          .then((newToken) => {
            setAccessToken(newToken);
          })
          .catch((error) => {
            // TODO: Handle error
          });
      } else {
        setAccessToken(null); // To be changed to a toast
        navigate('/');
      }
    });

    return unsubscribe;
  }, []);

  const user = React.useMemo(
    () =>
      accessToken
        ? (JSON.parse(atob(accessToken.split('.')[1])) as User)
        : null,
    [accessToken]
  );

  const onLogout = React.useCallback(() => {
    signOut(auth).catch((error) => {
      // TODO: Handle error
    });
  }, []);

  const onLogin = React.useCallback(async (loginData: LoginData) => {
    if (!loginData.email || !loginData.password) {
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const firebaseUser = userCredential.user;
      return firebaseUser;
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
