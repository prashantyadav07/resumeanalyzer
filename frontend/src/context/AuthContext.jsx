// --- START OF FILE src/context/AuthContext.jsx ---

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncUserWithBackend = async (user, token) => {
        try {
            await axios.post(
                `${API_BASE_URL}/users/sync`,
                { name: user.displayName, email: user.email, picture: user.photoURL },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to sync user with backend. Is backend running?", error);
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Sign-In Error", error);
        }
    };

    const signOut = () => {
        return firebaseSignOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken(true);
                setCurrentUser(user);
                await syncUserWithBackend(user, token);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    const value = { currentUser, loading, signInWithGoogle, signOut };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};