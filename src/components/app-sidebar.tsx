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
  Banknote
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path === '/dashboard' && pathname === '/');

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-4">
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
            <SidebarMenuButton asChild isActive={isActive("/copilot")} tooltip="Copiloto IA">
              <Link href="#">
                <Sparkles />
                <span>Copiloto IA</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/discover")} tooltip="Descobrir">
              <Link href="#">
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
            <SidebarMenuButton asChild isActive={isActive("/accounts")} tooltip="Contas">
              <Link href="/accounts">
                <Wallet />
                <span>Contas</span>
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
              <Link href="#">
                <ShoppingBasket />
                <span>Compras</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/pantry")} tooltip="Despensa">
              <Link href="#">
                <Carrot />
                <span>Despensa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/wishes")} tooltip="Desejos">
              <Link href="#">
                <Gift />
                <span>Desejos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/tasks")} tooltip="Tarefas">
              <Link href="#">
                <CheckSquare />
                <span>Tarefas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/goals")} tooltip="Metas">
              <Link href="#">
                <Target />
                <span>Metas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/calendar")} tooltip="Calendário">
              <Link href="#">
                <Calendar />
                <span>Calendário</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Ajustes">
              <Link href="#">
                <Settings />
                <span>Ajustes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-neutral-300">N</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">Kenned & Nicoli</p>
                <p className="text-sm text-muted-foreground">Juntos há 2 anos</p>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
