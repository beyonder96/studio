
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreHorizontal, Mail, Cake, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const defaultProfileImage = "https://placehold.co/600x800.png";

const getInitialProfileImage = (): string => {
  if (typeof window === 'undefined') {
    return defaultProfileImage;
  }
  return localStorage.getItem('app-profile-image') || defaultProfileImage;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string>(getInitialProfileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: 'Por favor, selecione uma imagem com menos de 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        localStorage.setItem('app-profile-image', result);
        toast({
            title: 'Foto de perfil atualizada!',
            description: 'Sua nova foto foi salva com sucesso.',
        })
      };
      reader.readAsDataURL(file);
    }
  };
  
   const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Profile Header */}
      <div className="relative w-full h-[60vh] md:h-[50vh] text-white">
        <Image
          src={profileImage}
          alt="Foto do casal"
          layout="fill"
          objectFit="cover"
          className="brightness-90"
          data-ai-hint="couple photo"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <div className="absolute top-6 left-4 right-4 flex justify-between z-20">
          <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 rounded-full" onClick={handleBackClick}>
            <ArrowLeft />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 rounded-full">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleImageClick}>
                <Camera className="mr-2 h-4 w-4" />
                Trocar Foto
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Editar Nomes</DropdownMenuItem>
              <DropdownMenuItem disabled>Editar Data</DropdownMenuItem>
              <DropdownMenuItem disabled>Editar E-mails</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-6 z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Kenned & Nicoli</h1>
            <p className="text-lg text-white/80">Juntos há 2 anos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground">
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-xl space-y-1 border border-white/20">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Cake className="w-4 h-4" />
                <span>Aniversário de Namoro</span>
              </div>
              <p className="text-xl font-semibold text-white">15 de Agosto</p>
              <p className="text-sm text-white/80">de 2022</p>
            </div>
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-xl space-y-1 border border-white/20">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Mail className="w-4 h-4" />
                <span>E-mails</span>
              </div>
              <p className="font-semibold truncate text-white">kenned@example.com</p>
              <p className="font-semibold truncate text-white">nicoli@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
       {/* Empty content area to push footer down if needed */}
       <div className="flex-grow bg-background"></div>

    </div>
  );
}
