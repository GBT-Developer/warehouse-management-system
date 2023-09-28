import { auth, secondaryAuth } from 'firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomUser } from 'renderer/interfaces/CustomUser';

export interface AuthData {
  password: string;
  email: string;
}

export interface AuthContext {
  accessToken: string | null;
  user: CustomUser | null;
  isLoggedIn: boolean;
  actions: {
    login: (loginData: AuthData) => Promise<CustomUser | undefined>;
    logout: () => void;
    register: (registerData: AuthData) => Promise<CustomUser | undefined>;
  };
}

export const initialAuthContext = {
  accessToken: null,
  user: null,
  isLoggedIn: false,
  actions: {
    login: () => Promise.resolve(undefined),
    logout: () => undefined,
    register: () => Promise.resolve(undefined),
  },
};

export const authContext = React.createContext<AuthContext | null>(
  initialAuthContext
);

export interface AuthProviderProps {
  children: React.ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState<string | null>(null); // Store token in memory
  const [user, setUser] = useState<CustomUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser)
        newUser
          .getIdToken()
          .then((newToken) => {
            setAccessToken(newToken);
            const { role } = JSON.parse(
              atob(newToken.split('.')[1])
            ) as CustomUser;
            const theUser = newUser as CustomUser;
            theUser.role = role;
            setUser(theUser);
          })
          .catch(() => {
            // TODO: Handle error
          });
      else {
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

  const onLogin = React.useCallback(async (loginData: AuthData) => {
    if (!loginData.email || !loginData.password) return;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      return userCredential.user as CustomUser;
    } catch (error) {
      // TODO: Handle error
    }
  }, []);

  const onRegister = React.useCallback(async (registerData: AuthData) => {
    console.log(user?.role);
    if (
      !registerData.email ||
      !registerData.password ||
      !user ||
      user.role !== 'owner'
    )
      return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        registerData.email,
        registerData.password
      );

      return userCredential.user as CustomUser;
    } catch (error) {
      console.log(error);
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
        register: onRegister,
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
  if (!contextValue)
    throw new Error('ensure to use useAuth within its provider');

  return contextValue;
};
