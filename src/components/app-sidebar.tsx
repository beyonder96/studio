
"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Target,
  CheckSquare,
  Calendar,
  Settings,
  Gift,
  HeartHandshake,
  ShoppingBasket,
  Carrot,
  Compass,
  Sparkles,
  Banknote,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";


const defaultProfileImage = "https://placehold.co/80x80.png";

export default function AppSidebar() {
  const pathname = usePathname();
  const [profileImage, setProfileImage] = useState(defaultProfileImage);
  const [profileName, setProfileName] = useState("Kenned & Nicoli");

  useEffect(() => {
    // Load image and data from localStorage only on the client-side
    const savedImage = localStorage.getItem('app-profile-image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    const savedData = localStorage.getItem('app-profile-data');
    if (savedData) {
        setProfileName(JSON.parse(savedData).names);
    }
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'app-profile-image') {
            const updatedImage = localStorage.getItem('app-profile-image');
            if (updatedImage) {
                setProfileImage(updatedImage);
            }
        }
        if (e.key === 'app-profile-data') {
            const updatedData = localStorage.getItem('app-profile-data');
            if(updatedData) {
                setProfileName(JSON.parse(updatedData).names)
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/")}
              tooltip="Dashboard"
            >
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/copilot")} tooltip="Copiloto IA (Em Breve)" disabled>
              <Link href="#">
                <Sparkles />
                <span>Copiloto IA</span>
                 <Badge variant="secondary" className="ml-auto !text-xs text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">Em Breve</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/discover")} tooltip="Descobrir">
              <Link href="/discover">
                <Compass />
                <span>Descobrir</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/finance")} tooltip="Finanças">
              <Link href="/finance">
                <Banknote />
                <span>Finanças</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/accounts")} tooltip="Categorias">
              <Link href="/accounts">
                <Wallet />
                <span>Categorias</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/recurrences")} tooltip="Recorrências">
              <Link href="/recurrences">
                <ArrowRightLeft />
                <span>Recorrências</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/purchases")} tooltip="Compras">
              <Link href="/purchases">
                <ShoppingBasket />
                <span>Compras</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/pantry")} tooltip="Despensa">
              <Link href="/pantry">
                <Carrot />
                <span>Despensa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/wishes")} tooltip="Desejos">
              <Link href="/wishes">
                <Gift />
                <span>Desejos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/tasks")} tooltip="Tarefas">
              <Link href="/tasks">
                <CheckSquare />
                <span>Tarefas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/goals")} tooltip="Metas (Em Breve)" disabled>
              <Link href="#">
                <Target />
                <span>Metas</span>
                <Badge variant="secondary" className="ml-auto !text-xs text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">Em Breve</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/calendar")} tooltip="Calendário">
              <Link href="/calendar">
                <Calendar />
                <span>Calendário</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <div className={cn(
            "flex items-center gap-3 rounded-md p-2 transition-colors",
            "group-data-[state=collapsed]:p-0"
         )}>
            <Avatar className="h-10 w-10">
                <AvatarImage src={profileImage} alt="Foto do casal" data-ai-hint="couple photo"/>
                <AvatarFallback className="bg-primary/20">KN</AvatarFallback>
            </Avatar>
            <div className="group-data-[state=collapsed]:hidden">
                <p className="font-semibold truncate">{profileName}</p>
                 <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary">Ver perfil</Link>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
