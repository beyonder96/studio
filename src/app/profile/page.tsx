
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, Edit, Utensils, Film, Music, MapPin, Save, Calendar as CalendarIcon, Loader2, Disc, Mail, Users, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInYears, addYears, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


const defaultProfileImage = "https://placehold.co/600x800.png";

type ProfileData = {
  names: string;
  sinceDate?: string; // Store date as ISO string
  food: string;
  movie: string;
  music: string;
  place: string;
  email: string;
  partnerEmail: string;
  details: string;
};

const defaultProfileData: ProfileData = {
    names: 'Kenned & Nicoli',
    sinceDate: new Date().toISOString(),
    food: 'Pizza',
    movie: 'Interestelar',
    music: 'Bohemian Rhapsody',
    place: 'A praia ao entardecer',
    email: 'seuemail@exemplo.com',
    partnerEmail: 'parceiro@exemplo.com',
    details: 'Amamos viajar, descobrir novos restaurantes e assistir a séries juntos nos fins de semana. Sonhamos em conhecer o mundo, começando pela Itália!'
};

const getSinceText = (isoDate?: string): string => {
    if (!isoDate) return 'Defina a data de início';
    const startDate = new Date(isoDate);
    const now = new Date();
    
    const totalDays = differenceInDays(now, startDate);
    if (totalDays < 0) return 'Data no futuro!';

    const years = differenceInYears(now, startDate);
    const dateAfterYears = addYears(startDate, years);
    const days = differenceInDays(now, dateAfterYears);

    if (years > 0) {
        return `Juntos há ${years} ano${years > 1 ? 's' : ''} e ${days} dia${days !== 1 ? 's' : ''}`;
    }
    return `Juntos há ${totalDays} dia${totalDays !== 1 ? 's' : ''}`;
}


export default function ProfilePage() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [tempData, setTempData] = useState<ProfileData>(defaultProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    } else {
        // Set default if nothing is saved
        localStorage.setItem('app-profile-data', JSON.stringify(defaultProfileData));
    }
  }, []);

  const handleImageClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);

      const options = {
        maxSizeMB: 1, // Compress to a smaller size for localStorage
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          try {
              localStorage.setItem('app-profile-image', result);
              setProfileImage(result);
              window.dispatchEvent(new Event('storage')); // Notify other components of the change
              toast({
                  title: 'Foto de perfil atualizada!',
                  description: 'Sua nova foto foi salva com sucesso.',
              });
          } catch (e) {
              console.error(e);
              toast({
                  variant: 'destructive',
                  title: 'Erro ao salvar a foto',
                  description: 'A imagem é muito grande para ser salva. Tente uma imagem menor.',
              });
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erro ao processar a imagem',
            description: 'Não foi possível comprimir a imagem. Tente uma imagem diferente.',
        });
        setIsUploading(false);
      }
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
    window.dispatchEvent(new Event('storage')); // Notify other components of the change
    setIsEditing(false);
    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  const handleInputChange = (field: keyof Omit<ProfileData, 'sinceDate' | 'details'>, value: string) => {
    setTempData(prev => ({...prev, [field]: value}));
  };
  
  const handleTextareaChange = (field: keyof Pick<ProfileData, 'details'>, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newSinceDate = date.toISOString();
      // Update immediately if not in edit mode
      if (!isEditing) {
        const updatedData = { ...profileData, sinceDate: newSinceDate };
        setProfileData(updatedData);
        localStorage.setItem('app-profile-data', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
        toast({
            title: 'Data atualizada!',
            description: 'A data do relacionamento foi salva.',
        });
      } else {
        // Update temp data if in edit mode
        setTempData(prev => ({...prev, sinceDate: newSinceDate }));
      }
    }
  }

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl overflow-hidden">
        <CardContent className="p-0">
            <div className="flex flex-col bg-transparent">
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

                    <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="link" className="text-lg text-white/80 hover:text-white mt-1 h-auto p-1 disabled:opacity-70">
                            {isEditing ? getSinceText(tempData.sinceDate) : getSinceText(profileData.sinceDate)}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                        mode="single"
                        selected={isEditing ? (tempData.sinceDate ? new Date(tempData.sinceDate) : undefined) : (profileData.sinceDate ? new Date(profileData.sinceDate) : undefined)}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        locale={ptBR}
                        />
                    </PopoverContent>
                    </Popover>
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
                        <Button variant="secondary" onClick={handleImageClick} disabled={isUploading}>
                            {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Camera className="mr-2 h-4 w-4" />
                            )}
                            {isUploading ? 'Enviando...' : 'Trocar Foto'}
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

                {isEditing && (
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardTitle>Informações de Contato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Seu E-mail</Label>
                                <Input id="email" type="email" value={tempData.email} onChange={e => handleInputChange('email', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="partnerEmail">E-mail do Parceiro(a)</Label>
                                <Input id="partnerEmail" type="email" value={tempData.partnerEmail} onChange={e => handleInputChange('partnerEmail', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Info className="h-5 w-5" />
                           Detalhes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isEditing ? (
                            <Textarea
                                value={tempData.details}
                                onChange={e => handleTextareaChange('details', e.target.value)}
                                placeholder="Escrevam um pouco sobre vocês..."
                                rows={5}
                            />
                        ) : (
                            <p className="text-muted-foreground whitespace-pre-wrap">{profileData.details}</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-transparent">
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

                 <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Disc className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
                           Nossa Trilha Sonora
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator"
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </CardContent>
                </Card>
            </div>
            </div>
        </CardContent>
    </Card>
  );
}
