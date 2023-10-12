import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { getBlob, ref } from 'firebase/storage';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, db, secondaryAuth, storage } from 'renderer/firebase';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { CustomUser } from 'renderer/interfaces/CustomUser';

export interface LoginData {
  password: string;
  email: string;
}

export interface RegisterData {
  email: string;
  password: string;
  display_name: string;
  role: string;
}

export interface AuthContext {
  accessToken: string | null;
  user: CustomUser | null;
  isLoggedIn: boolean;
  actions: {
    login: (loginData: LoginData) => Promise<CustomUser | undefined>;
    logout: () => void;
    register: (registerData: RegisterData) => Promise<CustomUser | undefined>;
    setCurrentWarehouse: (newWarehousePosition: string) => void;
    setCurrentCompanyInfo: (newCompanyInfo: CompanyInfo) => void;
  };
  warehousePosition: string;
  companyInfo: CompanyInfo | null;
}

export const initialAuthContext = {
  accessToken: null,
  user: null,
  isLoggedIn: false,
  actions: {
    login: () => Promise.resolve(undefined),
    logout: () => undefined,
    register: () => Promise.resolve(undefined),
    setCurrentWarehouse: () => undefined,
    setCurrentCompanyInfo: () => undefined,
  },
  warehousePosition: '',
  companyInfo: null,
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
  const [warehouse, setWarehouse] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    // Firebase auth state change listener
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser)
        newUser
          .getIdToken()
          .then(async (newToken) => {
            setAccessToken(newToken);

            const { user_id } = JSON.parse(atob(newToken.split('.')[1])) as {
              user_id: string | undefined;
            };

            if (!user_id) throw new Error('Token tidak valid');

            // Retrieving user role
            const userRef = doc(db, 'user', user_id);
            const userSnapshot = await getDoc(userRef);
            const userData = userSnapshot.data() as CustomUser | undefined;
            if (!userData) throw new Error('User tidak ditemukan');
            userData.id = userSnapshot.id;

            const theUser = {
              display_name: userData.display_name,
              email: userData.email,
              id: userData.id,
              role: userData.role,
            } as CustomUser;

            // Retrieving company info
            const companyRef = doc(db, 'company_info', 'my_company');
            const companySnapshot = await getDoc(companyRef);
            const companyData = companySnapshot.data() as
              | CompanyInfo
              | undefined;
            if (companyData) {
              const spaceRef = ref(storage, companyData.logo);

              await getBlob(spaceRef)
                .then((url) => {
                  companyData.logo = URL.createObjectURL(url);
                })
                .catch(() => {
                  companyData.logo = 'company_info/company_logo.png';
                });
            }

            setUser(() => theUser);
            setWarehouse(
              theUser.role.toLowerCase() === 'owner'
                ? 'Semua Gudang'
                : theUser.role
            );
            setCompanyInfo(() => companyData ?? null);
            navigate('/profile');
          })
          .catch(() => {
            setAccessToken(null);
            setUser(null);
            setCompanyInfo(null);
            signOut(auth);
          });
      else {
        setAccessToken(null);
        setUser(null);
        setCompanyInfo(null);
        navigate('/');
      }
    });

    return unsubscribe;
  }, []);

  const onLogout = React.useCallback(() => {
    signOut(auth).catch(() => {
      toast.error('Error logging out');
    });
  }, []);

  const onLogin = React.useCallback(async (loginData: LoginData) => {
    if (!loginData.email || !loginData.password)
      return Promise.reject('Mohon isi semua kolom');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      ).catch((error: FirebaseError) => {
        let errMessage = '';
        switch (error.code) {
          case 'auth/invalid-email':
            errMessage = 'Email tidak valid';
            break;
          case 'auth/user-disabled':
            errMessage = 'User nonaktif';
            break;
          case 'auth/user-not-found':
            errMessage = 'User tidak ditemukan';
            break;
          case 'auth/wrong-password':
            errMessage = 'Password salah';
            break;
          default:
            errMessage = 'Terjadi kesalahan di sistem';
            break;
        }
        return Promise.reject(errMessage);
      });
      const userRef = doc(db, 'user', userCredential.user.uid);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data() as CustomUser | undefined;

      if (!userData) {
        await signOut(auth);
        return Promise.reject('User tidak ditemukan');
      }

      return userData;
    } catch (error) {
      const errorMessage = error as string;
      return Promise.reject(errorMessage);
    }
  }, []);

  const onRegister = React.useCallback(
    async (registerData: RegisterData) => {
      if (!registerData.email || !registerData.password)
        return Promise.reject('Please fill all fields');

      if (!user || user.role.toLocaleLowerCase() !== 'owner')
        return Promise.reject('Only owner can create admin');

      try {
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          registerData.email,
          registerData.password
        ).catch((error: FirebaseError) => {
          let errMessage = '';
          switch (error.code) {
            case 'auth/email-already-in-use':
              errMessage = 'Email already in use';
              break;
            case 'auth/invalid-email':
              errMessage = 'Invalid email';
              break;
            case 'auth/weak-password':
              errMessage = 'Weak password';
              break;
            default:
              errMessage = 'Something went wrong';
              break;
          }
          return Promise.reject(errMessage);
        });

        await runTransaction(db, (transaction) => {
          transaction.set(doc(db, 'user', userCredential.user.uid), {
            display_name: registerData.display_name,
            email: registerData.email,
            role: registerData.role,
          });

          return Promise.resolve();
        });

        const theUser = {
          display_name: registerData.display_name,
          email: registerData.email,
          role: registerData.role,
          id: userCredential.user.uid,
        } as CustomUser;

        return theUser;
      } catch (error) {
        const errorMessage = error as string;
        return Promise.reject(errorMessage);
      }
    },
    [user]
  );

  const onChangeWarehouse = React.useCallback(
    (newWarehousePosition: string) => {
      setWarehouse(() => newWarehousePosition);
    },
    []
  );

  const onChangeCompanyInfo = React.useCallback(
    (newCompanyInfo: CompanyInfo) => {
      setCompanyInfo(() => newCompanyInfo);
    },
    []
  );

  const authValue = useMemo(
    () => ({
      accessToken,
      user,
      isLoggedIn: !!user?.id,
      actions: {
        login: onLogin,
        logout: onLogout,
        register: onRegister,
        setCurrentWarehouse: onChangeWarehouse,
        setCurrentCompanyInfo: onChangeCompanyInfo,
      },
      warehousePosition: warehouse,
      companyInfo,
    }),
    [
      accessToken,
      user,
      onLogin,
      onLogout,
      onRegister,
      onChangeWarehouse,
      warehouse,
      onChangeCompanyInfo,
      companyInfo,
    ]
  );

  return (
    <authContext.Provider value={authValue}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const contextValue = useContext(authContext);
  if (!contextValue)
    throw new Error('ensure to use useAuth within its provider');

  return contextValue;
};
