
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, Edit, Utensils, Film, Music, MapPin, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const defaultProfileImage = "https://placehold.co/600x800.png";

type ProfileData = {
  names: string;
  since: string;
  food: string;
  movie: string;
  music: string;
  place: string;
};

const defaultProfileData: ProfileData = {
    names: 'Kenned & Nicoli',
    since: 'Juntos há 2 anos',
    food: 'Pizza',
    movie: 'Interestelar',
    music: 'Bohemian Rhapsody',
    place: 'A praia ao entardecer'
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [tempData, setTempData] = useState<ProfileData>(defaultProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load image and data from localStorage only on the client-side
    const savedImage = localStorage.getItem('app-profile-image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    const savedData = localStorage.getItem('app-profile-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProfileData(parsedData);
      setTempData(parsedData);
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

  const handleEditClick = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    setProfileData(tempData);
    localStorage.setItem('app-profile-data', JSON.stringify(tempData));
    setIsEditing(false);
    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setTempData(prev => ({...prev, [field]: value}));
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
            {isEditing ? (
              <Input
                type="text"
                value={tempData.names}
                onChange={e => handleInputChange('names', e.target.value)}
                className="text-4xl md:text-5xl font-bold bg-transparent text-center border-2 border-dashed border-white/50 h-auto p-2"
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold">{profileData.names}</h1>
            )}
            {isEditing ? (
              <Input
                type="text"
                value={tempData.since}
                onChange={e => handleInputChange('since', e.target.value)}
                className="text-lg bg-transparent text-center border-2 border-dashed border-white/50 h-auto p-1 mt-2"
              />
            ) : (
              <p className="text-lg text-white/80 mt-1">{profileData.since}</p>
            )}
        </div>
      </div>
      
       {/* Actions */}
        <div className="flex justify-center gap-2 p-4 -mt-8 relative z-20">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancelClick}>
                    Cancelar
                </Button>
                 <Button onClick={handleSaveClick}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleImageClick}>
                    <Camera className="mr-2 h-4 w-4" />
                    Trocar Foto
                </Button>
                 <Button variant="secondary" onClick={handleEditClick}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                </Button>
              </>
            )}
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
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Comida Favorita</p>
                            {isEditing ? (
                                <Input type="text" value={tempData.food} onChange={e => handleInputChange('food', e.target.value)} className="h-9"/>
                            ) : (
                                <p className="font-semibold">{profileData.food}</p>
                            )}
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Film className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Filme Favorito</p>
                            {isEditing ? (
                                <Input type="text" value={tempData.movie} onChange={e => handleInputChange('movie', e.target.value)} className="h-9"/>
                            ) : (
                                <p className="font-semibold">{profileData.movie}</p>
                            )}
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Music className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Música Favorita</p>
                             {isEditing ? (
                                <Input type="text" value={tempData.music} onChange={e => handleInputChange('music', e.target.value)} className="h-9"/>
                            ) : (
                                <p className="font-semibold">{profileData.music}</p>
                            )}
                        </div>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Lugar Favorito</p>
                            {isEditing ? (
                                <Input type="text" value={tempData.place} onChange={e => handleInputChange('place', e.target.value)} className="h-9"/>
                            ) : (
                                <p className="font-semibold">{profileData.place}</p>
                            )}
                        </div>
                    </li>
                </ul>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
