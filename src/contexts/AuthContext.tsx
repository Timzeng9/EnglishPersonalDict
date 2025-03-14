import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; 
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextProps {
    currentUser: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
    currentUser: null,
    loading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe; 
    }, []);

    const value = {
        currentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
    );
}