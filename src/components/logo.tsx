
'use client';

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";


export function LogoIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shrink-0">
      <Heart className="h-7 w-7 text-primary-foreground animate-heart-pulse" />
    </div>
  )
}

export function DashboardHeader() {
  const [profileName, setProfileName] = useState("Carregando...");

  useEffect(() => {
    const updateProfileName = () => {
      const savedData = localStorage.getItem('app-profile-data');
      if (savedData) {
        setProfileName(JSON.parse(savedData).names);
      } else {
        setProfileName("Casal");
      }
    };

    updateProfileName();

    window.addEventListener('storage', updateProfileName);
    return () => window.removeEventListener('storage', updateProfileName);
  }, []);

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
