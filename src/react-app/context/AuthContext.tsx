import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    const checkWhitelist = async (email: string) => {
        const normalizedEmail = email.toLowerCase();
        // Fallback/Bootstrap for the specified admin email
        if (normalizedEmail === 'josejaviergarciap123@gmail.com') return true;

        try {
            const docRef = doc(db, "whitelisted_users", normalizedEmail);
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (error) {
            console.error("Error checking whitelist:", error);
            return false;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser && currentUser.email) {
                const allowed = await checkWhitelist(currentUser.email);
                setIsAllowed(allowed);
                setUser(currentUser);
                if (!allowed) {
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setIsAllowed(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            if (!email || !(await checkWhitelist(email))) {
                await signOut(auth);
                setIsAllowed(false);
                throw new Error("Acceso Denegado: No estás en la lista blanca.");
            }
            setIsAllowed(true);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        setIsAllowed(false);
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, isAllowed }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
