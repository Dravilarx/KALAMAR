import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile } from '../types/user';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                // Auto-login logic
                const email = 'familia@kalamar.app';
                const password = 'kalamar-home-secure';

                try {
                    await signInWithEmailAndPassword(auth, email, password);
                } catch (error: any) {
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                        try {
                            const cred = await createUserWithEmailAndPassword(auth, email, password);
                            const profile: UserProfile = {
                                id: cred.user.uid,
                                email,
                                displayName: 'Familia Kalamar',
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };
                            await setDoc(doc(db, 'users', cred.user.uid), profile);
                        } catch (createError) {
                            console.error('Error creating default user:', createError);
                        }
                    } else {
                        console.error('Auto-login error:', error);
                    }
                }
                return;
            }

            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data() as UserProfile);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = async (email: string, password: string, displayName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user profile in Firestore
            const profile: UserProfile = {
                id: userCredential.user.uid,
                email,
                displayName,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), profile);
            setUserProfile(profile);
        } catch (error: any) {
            throw new Error(getErrorMessage(error.code));
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            throw new Error(getErrorMessage(error.code));
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error: any) {
            throw new Error('Error al cerrar sesión');
        }
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to translate Firebase error codes to Spanish
function getErrorMessage(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está registrado';
        case 'auth/invalid-email':
            return 'Correo electrónico inválido';
        case 'auth/operation-not-allowed':
            return 'Operación no permitida';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres';
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada';
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo electrónico';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta';
        case 'auth/invalid-credential':
            return 'Credenciales inválidas';
        default:
            return 'Error de autenticación. Por favor intenta nuevamente.';
    }
}
