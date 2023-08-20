import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from 'firebase';
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
    login: (loginData: LoginData) => Promise<CustomUser | void>;
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
  const [user, setUser] = useState<CustomUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser) {
        newUser
          .getIdToken()
          .then((newToken) => {
            setAccessToken(newToken);
            const { owner } = JSON.parse(
              atob(newToken.split('.')[1])
            ) as CustomUser;
            const theUser = newUser as CustomUser;
            theUser.owner = owner;
            setUser(theUser);
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const firebaseUser = userCredential.user;
      return firebaseUser as CustomUser;
    } catch (error) {
      // TODO: Handle error
    }
  }, []);

  const authValue = useMemo(
    () => ({
      accessToken,
      user,
      isLoggedIn: !!accessToken,
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
