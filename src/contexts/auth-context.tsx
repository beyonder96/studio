
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, getAdditionalUserInfo, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useFCM } from '@/hooks/use-fcm';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signInWithGoogle: async () => {}, getAccessToken: async () => null });

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
    if (!auth.currentUser) return null;
    try {
        const token = await auth.currentUser.getIdToken(true);
        // This is the Firebase ID token, not the OAuth access token for Google APIs.
        // We need to re-authenticate to get a fresh OAuth access token if needed.
        // For simplicity, we'll re-trigger the popup flow if we need a fresh token with scopes.
        // A more advanced implementation would use refresh tokens silently.
        
        // This is a placeholder. The actual access token is retrieved during sign-in.
        // The logic in signInWithGoogle handles storing it.
        // Let's try to get it from the user object if possible, but it may not be there.
        // @ts-ignore
        if (auth.currentUser.stsTokenManager.accessToken) {
             // @ts-ignore
             return auth.currentUser.stsTokenManager.accessToken;
        }
        return null; // Should re-auth to get a proper one.

    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken; // This is the token we need!

       if (accessToken && user) {
            const db = getDatabase(firebaseApp);
            const tokenRef = ref(db, `users/${user.uid}/googleAccessToken`);
            await set(tokenRef, accessToken);
        }
      
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

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, getAccessToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
