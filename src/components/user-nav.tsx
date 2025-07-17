
'use client';

import Link from "next/link";
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
import { CreditCard, HelpCircle, LogOut, Settings, User as UserIcon, LayoutDashboard, Banknote, ShoppingBasket, Gift } from "lucide-react";
import { useState, useEffect } from "react";

export function UserNav() {
    const [profileImage, setProfileImage] = useState("https://placehold.co/80x80.png");
    const [profileName, setProfileName] = useState("Kenned & Nicoli");
    const [profileEmail, setProfileEmail] = useState("casal@email.com");


    useEffect(() => {
        const savedImage = localStorage.getItem('app-profile-image');
        if (savedImage) setProfileImage(savedImage);
        
        const savedData = localStorage.getItem('app-profile-data');
        if (savedData) setProfileName(JSON.parse(savedData).names);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'app-profile-image') {
                const updatedImage = localStorage.getItem('app-profile-image');
                if (updatedImage) setProfileImage(updatedImage);
            }
             if (e.key === 'app-profile-data') {
                const updatedData = localStorage.getItem('app-profile-data');
                if(updatedData) setProfileName(JSON.parse(updatedData).names);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt="Foto do casal" data-ai-hint="couple photo"/>
            <AvatarFallback className="bg-primary/20">KN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profileName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profileEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
         <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Painel</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/finance">
                <Banknote className="mr-2 h-4 w-4" />
                <span>Finanças</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/purchases">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                <span>Compras</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/wishes">
                <Gift className="mr-2 h-4 w-4" />
                <span>Desejos</span>
                </Link>
            </DropdownMenuItem>
        </DropdownMenuGroup>
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
        <DropdownMenuItem disabled>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
