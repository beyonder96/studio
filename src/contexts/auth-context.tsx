
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useFCM } from '@/hooks/use-fcm';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signInWithGoogle: async () => {} });

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
  
  const signInWithGoogle = async () => {
    if (!auth) return;
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
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
