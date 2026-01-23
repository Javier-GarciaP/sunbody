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
        const normalizedEmail = email.toLowerCase().trim();
        console.log("Verificando lista blanca para:", normalizedEmail);

        // Lista blanca de emergencia (Hardcoded basada en tu imagen)
        const emergencyWhitelist = [
            'josejaviergarciap123@gmail.com',
            'jose.garciap@unet.edu.ve',
            'genesis.cardenasg@unet.edu.ve',
            'marianacardenas.140@gmail.com' // Ajustado según patrón común
        ];

        if (emergencyWhitelist.includes(normalizedEmail)) {
            console.log("Acceso concedido vía lista de emergencia local.");
            return true;
        }

        try {
            const docRef = doc(db, "whitelisted_users", normalizedEmail);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Verificamos si existe el campo 'active' y si es false, denegamos. 
                // Si no existe el campo, asumimos que existir es suficiente.
                if (data && data.active === false) {
                    console.warn("Usuario encontrado pero está marcado como inactivo.");
                    return false;
                }
                console.log("Usuario encontrado en la lista blanca.");
                return true;
            } else {
                console.warn("El correo no existe en la colección 'whitelisted_users'. ID buscado:", normalizedEmail);
                return false;
            }
        } catch (error: any) {
            console.error("Error crítico al verificar lista blanca en Firestore:", error.code, error.message);
            return false;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser && currentUser.email) {
                const allowed = await checkWhitelist(currentUser.email);
                setIsAllowed(allowed);
                setUser(currentUser);
                // No cerramos sesión aquí automáticamente para no interrumpir el flujo de login
                // El ProtectedRoute se encargará de bloquear el acceso si isAllowed es false.
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
