
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, getAdditionalUserInfo, GoogleAuthProvider, AuthCredential, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useFCM } from '@/hooks/use-fcm';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signInWithGoogle: async () => { throw new Error('signInWithGoogle not implemented') }, getAccessToken: async () => null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { init } = useFCM();

  useEffect(() => {
    // auth is only available on the client
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
          init(user.uid); // Initialize FCM when user logs in
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        // If on server, we're not loading and there's no user.
        setLoading(false);
    }
  }, [init]);
  
  const getAccessToken = useCallback(async (): Promise<string | null> => {
     // This method is being simplified as getting a token without re-auth is complex.
     // The primary way to get a token is now via signInWithGoogle.
    if (!auth.currentUser) return null;
    try {
        const credential = await signInWithGoogle();
        const token = GoogleAuthProvider.credentialFromResult(credential)?.accessToken;
        return token || null;
    } catch (error) {
        console.error("Error getting ID token:", error);
        return null;
    }
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      
      // If new user, create a profile entry
      if (additionalInfo?.isNewUser) {
        const db = getDatabase(firebaseApp);
        const profileRef = ref(db, `users/${user.uid}/profile`);
        
        // Check if profile already exists to prevent overwriting
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

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, getAccessToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
