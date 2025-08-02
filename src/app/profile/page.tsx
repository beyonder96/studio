
'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, Edit, Utensils, Film, Music, MapPin, Save, Calendar as CalendarIcon, Loader2, Disc, Mail, Users, Info, Gift as GiftIcon, HeartPulse, Shield, Phone, Hospital, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { FinanceContext, HealthInfo, Achievement } from '@/contexts/finance-context';
import { Badge } from '@/components/ui/badge';


const defaultProfileImage = "https://placehold.co/600x800.png";

type ProfileData = {
  names?: string;
  sinceDate?: string;
  birthday1?: string;
  birthday2?: string;
  food?: string;
  movie?: string;
  music?: string;
  place?: string;
  location?: string;
  email?: string;
  partnerEmail?: string;
  details?: string;
  profileImage?: string;
  healthInfo1?: HealthInfo;
  healthInfo2?: HealthInfo;
};

const defaultHealthInfo: HealthInfo = {
    bloodType: '',
    allergies: '',
    healthPlan: '',
    emergencyContact: '',
};

const defaultProfileData: ProfileData = {
    names: 'Kenned & Nicoli',
    sinceDate: new Date().toISOString(),
    birthday1: '',
    birthday2: '',
    food: 'Pizza',
    movie: 'Interestelar',
    music: 'Bohemian Rhapsody',
    place: 'A praia ao entardecer',
    location: '',
    email: '',
    partnerEmail: '',
    details: 'Amamos viajar, descobrir novos restaurantes e assistir a séries juntos nos fins de semana. Sonhamos em conhecer o mundo, começando pela Itália!',
    profileImage: defaultProfileImage,
    healthInfo1: defaultHealthInfo,
    healthInfo2: defaultHealthInfo,
};

const getSinceText = (isoDate?: string): string => {
    if (!isoDate || !isValid(parseISO(isoDate))) return 'Defina a data de início';

    const [year, month, day] = isoDate.split('T')[0].split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const now = new Date();
    const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const totalDays = Math.max(0, Math.floor((nowUTC.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return `Juntos há ${totalDays} dia${totalDays !== 1 ? 's' : ''}`;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { achievements } = useContext(FinanceContext);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [tempData, setTempData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sinceText, setSinceText] = useState('Carregando...');

  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      
      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fetchedData = {
              ...defaultProfileData,
              ...data,
              email: data.email || user.email,
              healthInfo1: data.healthInfo1 || defaultHealthInfo,
              healthInfo2: data.healthInfo2 || defaultHealthInfo,
          };
          setProfileData(fetchedData);
          setTempData(fetchedData);
        } else {
            const initialData = { 
                ...defaultProfileData, 
                email: user.email,
                birthday1: '',
                birthday2: '',
             };
            update(profileRef, initialData);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

   useEffect(() => {
        if(profileData.sinceDate){
            setSinceText(getSinceText(profileData.sinceDate));
        }
    }, [profileData.sinceDate]);

  const handleImageClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setIsUploading(true);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const db = getDatabase(firebaseApp);
          const profileRef = ref(db, `users/${user.uid}/profile`);
          update(profileRef, { profileImage: result }).then(() => {
             toast({
                title: 'Foto de perfil atualizada!',
                description: 'Sua nova foto foi salva com sucesso.',
             });
          }).catch((e) => {
              console.error(e);
              toast({
                  variant: 'destructive',
                  title: 'Erro ao salvar a foto',
                  description: 'Não foi possível salvar a imagem. Tente novamente.',
              });
          }).finally(() => {
             setIsUploading(false);
          });
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

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setTempData(profileData);
    setIsEditing(false);
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const db = getDatabase(firebaseApp);
    const profileRef = ref(db, `users/${user.uid}/profile`);
    
    update(profileRef, tempData).then(() => {
        setIsEditing(false);
        toast({
          title: 'Perfil atualizado!',
          description: 'Suas informações foram salvas com sucesso.',
        });
    });
  }

  const handleInputChange = (field: keyof Omit<ProfileData, 'sinceDate' | 'details' | 'birthday1' | 'birthday2' | 'profileImage' | 'healthInfo1' | 'healthInfo2'>, value: string) => {
    setTempData(prev => ({...prev, [field]: value}));
  };

  const handleHealthInfoChange = (person: 'healthInfo1' | 'healthInfo2', field: keyof HealthInfo, value: string) => {
    setTempData(prev => ({
        ...prev,
        [person]: {
            ...prev[person],
            [field]: value,
        }
    }))
  };
  
  const handleTextareaChange = (field: keyof Pick<ProfileData, 'details'>, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDateSelect = (date: Date | undefined, field: 'sinceDate' | 'birthday1' | 'birthday2') => {
    if (date) {
      const newDate = date.toISOString();
      setTempData(prev => ({...prev, [field]: newDate }));
    }
  }

  const DateSelector = ({ date, onSelect, label }: { date?: string; onSelect: (d?: Date) => void; label: string; }) => {
    const selectedDate = date && isValid(parseISO(date)) ? parseISO(date) : undefined;
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : <span>{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onSelect}
                    initialFocus
                    locale={ptBR}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    classNames={{
                        caption_label: "hidden",
                        vhidden: "hidden",
                    }}
                />
            </PopoverContent>
        </Popover>
    );
};

  const [name1, name2] = (tempData.names || '').split(' & ').map(name => name.trim());
  const person1Name = name1 || 'Pessoa 1';
  const person2Name = name2 || 'Pessoa 2';

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col bg-transparent">
            {/* Profile Header */}
            <div className="relative w-full h-[35vh] sm:h-[45vh] text-white">
                <Image
                src={tempData.profileImage || defaultProfileImage}
                alt="Foto do casal"
                fill
                className="object-cover brightness-90"
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
                    <PopoverTrigger asChild disabled={!isEditing}>
                        <Button variant="link" className="text-lg text-white/80 hover:text-white mt-1 h-auto p-1 disabled:opacity-70 disabled:no-underline">
                           {isEditing ? getSinceText(tempData.sinceDate) : sinceText}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                        mode="single"
                        selected={tempData.sinceDate ? new Date(tempData.sinceDate) : undefined}
                        onSelect={(d) => handleDateSelect(d, 'sinceDate')}
                        disabled={(date) => date > new Date()}
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
                        <Button variant="secondary" onClick={handleCancelClick} type="button">
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                        </Button>
                    </>
                    ) : (
                    <>
                        <Button variant="secondary" onClick={handleImageClick} disabled={isUploading} type="button">
                            {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Camera className="mr-2 h-4 w-4" />
                            )}
                            {isUploading ? 'Enviando...' : 'Trocar Foto'}
                        </Button>
                        <Button variant="secondary" onClick={handleEditClick} type="button">
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
                            <CardTitle>Informações de Contato e Localização</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="location">Sua Localização (Cidade/Estado)</Label>
                                <Input id="location" type="text" value={tempData.location} onChange={e => handleInputChange('location', e.target.value)} placeholder="Ex: São Paulo, SP"/>
                            </div>
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
                           <GiftIcon className="h-5 w-5" />
                           Datas Importantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DateSelector
                                    date={tempData.birthday1}
                                    onSelect={(d) => handleDateSelect(d, 'birthday1')}
                                    label={`Aniversário de ${person1Name}`}
                                />
                                <DateSelector
                                    date={tempData.birthday2}
                                    onSelect={(d) => handleDateSelect(d, 'birthday2')}
                                    label={`Aniversário de ${person2Name}`}
                                />
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p className="text-muted-foreground">{person1Name}: {profileData.birthday1 && isValid(parseISO(profileData.birthday1)) ? format(parseISO(profileData.birthday1), "d 'de' MMMM", { locale: ptBR }) : 'Não definido'}</p>
                                <p className="text-muted-foreground">{person2Name}: {profileData.birthday2 && isValid(parseISO(profileData.birthday2)) ? format(parseISO(profileData.birthday2), "d 'de' MMMM", { locale: ptBR }) : 'Não definido'}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>

                 <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Trophy className="h-5 w-5" />
                           Conquistas do Casal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {achievements && achievements.length > 0 ? (
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                               {achievements.map(ach => (
                                   <div key={ach.id} className="flex flex-col items-center text-center gap-2 p-3 border rounded-lg bg-background/50">
                                       <span className="text-4xl">{ach.icon}</span>
                                       <h4 className="font-semibold text-sm">{ach.name}</h4>
                                       <p className="text-xs text-muted-foreground">{ach.description}</p>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <p className="text-muted-foreground text-center">Comecem a usar o app para desbloquear conquistas!</p>
                       )}
                    </CardContent>
                </Card>

                <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeartPulse className="h-5 w-5" />
                            Saúde e Emergência
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Person 1 Health Info */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-center md:text-left">{person1Name}</h4>
                            <div className="space-y-2">
                                <Label>Tipo Sanguíneo</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo1?.bloodType} onChange={e => handleHealthInfoChange('healthInfo1', 'bloodType', e.target.value)} placeholder="Ex: A+" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo1?.bloodType || 'Não informado'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Alergias</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo1?.allergies} onChange={e => handleHealthInfoChange('healthInfo1', 'allergies', e.target.value)} placeholder="Ex: Poeira, Lactose" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo1?.allergies || 'Nenhuma'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Plano de Saúde</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo1?.healthPlan} onChange={e => handleHealthInfoChange('healthInfo1', 'healthPlan', e.target.value)} placeholder="Ex: Plano Top (123456)" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo1?.healthPlan || 'Não informado'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Contato de Emergência</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo1?.emergencyContact} onChange={e => handleHealthInfoChange('healthInfo1', 'emergencyContact', e.target.value)} placeholder="Ex: Mãe (11 99999-8888)" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo1?.emergencyContact || 'Não informado'}</p>
                                )}
                            </div>
                        </div>

                        {/* Person 2 Health Info */}
                         <div className="space-y-4">
                            <h4 className="font-semibold text-center md:text-left">{person2Name}</h4>
                            <div className="space-y-2">
                                <Label>Tipo Sanguíneo</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo2?.bloodType} onChange={e => handleHealthInfoChange('healthInfo2', 'bloodType', e.target.value)} placeholder="Ex: O-" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo2?.bloodType || 'Não informado'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Alergias</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo2?.allergies} onChange={e => handleHealthInfoChange('healthInfo2', 'allergies', e.target.value)} placeholder="Ex: Glúten" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo2?.allergies || 'Nenhuma'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Plano de Saúde</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo2?.healthPlan} onChange={e => handleHealthInfoChange('healthInfo2', 'healthPlan', e.target.value)} placeholder="Ex: Plano Master (654321)" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo2?.healthPlan || 'Não informado'}</p>
                                )}
                            </div>
                             <div className="space-y-2">
                                <Label>Contato de Emergência</Label>
                                {isEditing ? (
                                    <Input value={tempData.healthInfo2?.emergencyContact} onChange={e => handleHealthInfoChange('healthInfo2', 'emergencyContact', e.target.value)} placeholder="Ex: Pai (11 98888-7777)" />
                                ) : (
                                    <p className="text-muted-foreground">{profileData.healthInfo2?.emergencyContact || 'Não informado'}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                            src="https://open.spotify.com/embed/playlist/4LHaagezLTAeXpoaIQOHOP?utm_source=generator"
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
            </form>
        </CardContent>
    </Card>
  );
}
