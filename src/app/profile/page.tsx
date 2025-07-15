
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Edit, Share2, Film, Music, Utensils, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const defaultProfileImage = "https://placehold.co/600x800.png";

export default function ProfilePage() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load image from localStorage only on the client-side after initial render
    const savedImage = localStorage.getItem('app-profile-image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

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
    <div className="flex flex-col min-h-screen -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 bg-background">
      {/* Profile Header */}
      <div className="relative w-full h-[45vh] text-white">
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
        </div>

        <div className="absolute bottom-6 left-0 right-0 p-6 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-bold">Kenned & Nicoli</h1>
            <p className="text-lg text-white/80 mt-1">Juntos há 2 anos</p>
        </div>
      </div>
      
       {/* Actions */}
        <div className="flex justify-center gap-2 p-4 -mt-8 relative z-20">
            <Button variant="secondary" onClick={handleImageClick}>
                <Camera className="mr-2 h-4 w-4" />
                Trocar Foto
            </Button>
             <Button variant="secondary" disabled>
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
            </Button>
             <Button variant="secondary" disabled>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
            </Button>
        </div>

       {/* Content Area */}
       <div className="flex-grow p-4 md:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Nossos Favoritos</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Utensils className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Comida Favorita</p>
                            <p className="font-semibold">Pizza</p>
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Film className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Filme Favorito</p>
                            <p className="font-semibold">Interestelar</p>
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Music className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Música Favorita</p>
                            <p className="font-semibold">Bohemian Rhapsody</p>
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Lugar Favorito</p>
                            <p className="font-semibold">A praia ao entardecer</p>
                        </div>
                    </li>
                </ul>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
