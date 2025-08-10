
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, getAdditionalUserInfo, GoogleAuthProvider, AuthCredential, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useFCM } from '@/hooks/use-fcm';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  getAccessToken: () => Promise<string | null>;
  googleAccessToken: string | null;
};

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true, 
    signInWithGoogle: async () => { throw new Error('signInWithGoogle not implemented') }, 
    getAccessToken: async () => null,
    googleAccessToken: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { init } = useFCM();
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('google_access_token') : null;
    if(storedToken) {
        setGoogleAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
          init(user.uid); 
        } else {
          // Clear token on logout
          sessionStorage.removeItem('google_access_token');
          setGoogleAccessToken(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [init]);
  
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (googleAccessToken) return googleAccessToken;
    
    toast({ title: 'Conectando com o Google...', description: 'Por favor, autorize o acesso na janela pop-up.'});
    // If no token, prompt sign-in to get one
    try {
        const result = await signInWithGoogle();
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        if(token) {
            setGoogleAccessToken(token);
            sessionStorage.setItem('google_access_token', token);
            return token;
        }
        return null;
    } catch (error: any) {
        console.error("Error getting Access token:", error);
         if (error.code !== 'auth/popup-closed-by-user') {
            toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Não foi possível obter a permissão necessária do Google.' });
        }
        return null;
    }
  }, [googleAccessToken]);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if(credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        sessionStorage.setItem('google_access_token', credential.accessToken);
      }

      const additionalInfo = getAdditionalUserInfo(result);
      
      if (additionalInfo?.isNewUser) {
        const db = getDatabase(firebaseApp);
        const profileRef = ref(db, `users/${user.uid}/profile`);
        
        const snapshot = await get(profileRef);
        if (!snapshot.exists()) {
             const profileData = { 
                names: user.displayName || "Novo Casal",
                email: user.email,
                partnerEmail: '',
                profileImage: user.photoURL || 'https://placehold.co/600x800.png',
             };
             await set(profileRef, profileData);
        }
      }
      return result;

    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, getAccessToken, googleAccessToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
