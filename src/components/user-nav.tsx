
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, HelpCircle, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { auth, app as firebaseApp } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

export function UserNav() {
    const router = useRouter();
    const { user } = useAuth();
    const [profileImage, setProfileImage] = useState("https://placehold.co/80x80.png");
    const [profileName, setProfileName] = useState("Carregando...");

    useEffect(() => {
        if (user) {
            const db = getDatabase(firebaseApp);
            const profileRef = ref(db, `users/${user.uid}/profile`);
            
            const unsubscribe = onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProfileName(data.names || "Casal");
                    setProfileImage(data.profileImage || "https://placehold.co/80x80.png");
                }
            }, (error) => {
                console.error(error);
                setProfileName("Casal");
                setProfileImage("https://placehold.co/80x80.png");
            });

            return () => unsubscribe();
        } else {
             setProfileName("Casal");
             setProfileImage("https://placehold.co/80x80.png");
        }
    }, [user]);
    
    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
        router.push('/login');
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt="Foto do casal" data-ai-hint="couple photo"/>
            <AvatarFallback className="bg-primary/20">{profileName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 user-nav-dropdown" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{profileName}</p>
            {user?.email && (
                <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Ajustes</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem disabled>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Assinatura</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuItem disabled>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Central de Ajuda</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
