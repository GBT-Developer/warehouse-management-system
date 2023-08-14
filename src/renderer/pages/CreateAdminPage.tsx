// admin page to create new user
import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {auth} from 'firebase'
import {createUserWithEmailAndPassword} from 'firebase/auth'
import { AppLayout } from 'renderer/layout/AppLayout';

export const CreateAdminPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');   

    const signUp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
        });
    }

    return (
        <AppLayout>
            <div className="admin-page">
                <form onSubmit={signUp}>
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
            </div>
        </AppLayout>
    )
}
