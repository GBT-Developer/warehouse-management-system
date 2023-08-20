import React, { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    addDoc,
    collection,
    doc,
    setDoc,
  } from "firebase/firestore";
import {auth, db} from 'firebase'
import {createUserWithEmailAndPassword} from 'firebase/auth'
import { AuthCard } from 'renderer/components/AuthCard';
import { PageLayout } from 'renderer/layout/PageLayout';

export const CreateAdminPage = () => { 
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');   

    const signUp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            setDoc(doc(collection(db, "users"), user.uid), {
                email: user.email,
            }).then(() => {
                navigate('/adminlistpage')
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
        });
    }

    return (
        <PageLayout>
            <AuthCard>
            <div className="flex flex-col gap-[0.5rem]">
                <form className="flex flex-col gap-[0.5rem]" onSubmit={signUp}>
                    <input type="email" 
                        name = "email"
                        id = 'email'
                        placeholder="name@company.com" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        required
                        onChange={(event) => setEmail(event.target.value)} 
                    />
                    <input type="password" 
                        placeholder="••••••••" 
                        name = "password"
                        id = 'password'
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        required
                        onChange={(event) => setPassword(event.target.value)} 
                    />
                    <button 
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
                    >
                        Create User
                    </button>
                </form>
                <button
                    type='button'
                    onClick={() => navigate('/adminlistpage')}
                    className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >Cancel
                </button>
            </div>
            </AuthCard>
        </PageLayout>
    )
}
