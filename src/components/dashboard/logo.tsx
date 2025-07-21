

'use client';

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getDatabase, ref, onValue } from "firebase/database";
import { app as firebaseApp } from "@/lib/firebase";


export function LogoIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shrink-0">
      <Heart className="h-7 w-7 text-primary-foreground animate-heart-pulse" />
    </div>
  )
}

export function DashboardHeader() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState("Carregando...");

  useEffect(() => {
    if (user) {
        const db = getDatabase(firebaseApp);
        const namesRef = ref(db, `users/${user.uid}/profile/names`);
        const unsubscribe = onValue(namesRef, (snapshot) => {
            const name = snapshot.val();
            setProfileName(name || "Casal");
        });
        return () => unsubscribe();
    } else {
        setProfileName("Casal");
    }
  }, [user]);

  return (
    <div className="flex items-center gap-4">
      <LogoIcon />
      <div>
        <h1 className="text-2xl font-bold text-foreground">{profileName}</h1>
        <p className="text-sm text-muted-foreground">Bem-vindos ao seu cantinho!</p>
      </div>
    </div>
  );
}


export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <Heart className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground">Vida a 2</h1>
      </div>
    </div>
  );
}

