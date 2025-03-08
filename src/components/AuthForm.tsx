// src/components/AuthForm.tsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import validate from 'validate.js';

interface AuthFormProps {
    onClose: () => void;
}

// 1. 错误码映射
const firebaseErrorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This user account has been disabled.',
    'auth/user-not-found': 'User not found.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email address is already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/missing-email': "Email is required",
    'auth/invalid-credential': "Incorrect email or password.",
    
};

// 2. 错误处理函数
function getFirebaseErrorMessage(errorCode: string): string {
    console.log(errorCode);
    return firebaseErrorMessages[errorCode] || 'An unexpected error occurred.';
}

const constraints = {
    email: {
        presence: { allowEmpty: false, message: 'is required' },
        email: { message: 'is not valid' },
    },
    password: {
        presence: { allowEmpty: false, message: 'is required' },
        length: {
            minimum: 6,
            message: 'must be at least 6 characters',
        },
    },
};

function AuthForm({ onClose }: AuthFormProps) {
    const [formState, setFormState] = useState({
        email: '',
        password: '',
    });
    const [isSignUp, setIsSignUp] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] } | null>(null);
    const [firebaseError, setFirebaseError] = useState<string | null>(null); // 单独存储 Firebase 错误

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFirebaseError(null); // 清除之前的 Firebase 错误

        const validationErrors = validate(formState, constraints);
        setErrors(validationErrors || null);

        if (!validationErrors) {
            try {
                if (isSignUp) {
                    await createUserWithEmailAndPassword(auth, formState.email, formState.password);
                } else {
                    await signInWithEmailAndPassword(auth, formState.email, formState.password);
                }
                onClose();
            } catch (error: any) {
                // 3. 使用错误处理函数
                setFirebaseError(getFirebaseErrorMessage(error.code));
            }
        }
    };



    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {firebaseError && <p className="text-red-500 mb-4">{firebaseError}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors?.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors?.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formState.password}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors?.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors?.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
            </form>

            <div className="mt-4 text-center">
                {isSignUp ? (
                    <p>
                        Already have an account?{' '}
                        <button
                            onClick={() => setIsSignUp(false)}
                            className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                            Sign In
                        </button>
                    </p>
                ) : (
                    <p>
                        Don't have an account?{' '}
                        <button
                            onClick={() => setIsSignUp(true)}
                            className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                            Sign Up
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default AuthForm;