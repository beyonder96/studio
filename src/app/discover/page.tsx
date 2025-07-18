
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Star,
  Bus,
  Bath,
  Bed,
  Ticket,
  ShieldCheck,
  Building,
  Star as StarIcon,
  Camera,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function DiscoverPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="bg-transparent -m-4 sm:-m-6">
            <div className="relative h-[40vh] w-full">
                <Image
                src="https://placehold.co/600x400.png"
                alt="Dakshina Chitra Heritage"
                layout="fill"
                objectFit="cover"
                className="brightness-90 rounded-t-3xl"
                data-ai-hint="heritage building"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/30 to-transparent" />

                {/* Header */}
                <div className="absolute top-6 left-4 right-4 flex items-center justify-between text-white">
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40" onClick={handleBackClick}>
                    <ArrowLeft />
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">Dakshina Chitra Heritage</h1>
                    <ShieldCheck className="h-5 w-5 fill-blue-500 text-white" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40">
                    <Bookmark />
                </Button>
                </div>

                {/* Play and Navigation */}
                <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white/80 fill-black/30" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 text-white">
                    <ChevronLeft />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 text-white">
                    <ChevronRight />
                </Button>
                </div>
            </div>

            <div className="p-4 space-y-6 -mt-6">
                {/* Location Info */}
                <Card className="shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-primary" />
                        <span className="text-2xl font-bold">632m</span>
                    </div>
                    <Button>
                        <MapPin className="mr-2 h-4 w-4" />
                        Directions
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    </div>
                    <div className="mt-2 text-muted-foreground">
                    <p>State highway 49, Muthukadu,</p>
                    <p>Tamil Nadu 603112</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                    <p>
                        <span className="text-orange-500">Closes soon</span>
                        <span className="text-muted-foreground"> • 7pm • Opens 10am Sun</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">5.0</span>
                        <span className="text-muted-foreground">(17.7k)</span>
                    </div>
                    </div>
                </CardContent>
                </Card>
                
                {/* Facilities */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Nossas Instalações</h2>
                        <Button variant="link" className="text-primary">Ver todas</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <Card className="p-4">
                            <Bus className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">6 Cabs</p>
                        </Card>
                        <Card className="p-4">
                            <Bath className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">8 Banheiros</p>
                        </Card>
                        <Card className="p-4">
                            <Bed className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">12 Quartos</p>
                        </Card>
                    </div>
                </div>
                
                {/* Buy Tickets */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Comprar Ingressos</h2>
                        <Button variant="link" className="text-primary">Todos os ingressos</Button>
                    </div>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Ticket className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-semibold">Dakshina Chitra Heritage Museum</p>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-normal">
                                        <ShieldCheck className="mr-1 h-3 w-3" /> Site Oficial
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">R$350.00</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Description */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Descrição</h2>
                    <p className="text-muted-foreground">
                        Museu transcultural com 18 casas históricas,
                        juntamente com arte, artesanato e performances.
                    </p>
                </div>

                {/* Details */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Detalhes</h2>
                        <Button variant="link" className="text-primary">Ver todos</Button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 mt-1 text-muted-foreground"/>
                            <div>
                                <p className="font-medium">Endereço</p>
                                <p className="text-muted-foreground">State highway 49, Muthukadu, Tamil Nadu, Índia, 603112</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-5 w-5 mt-1 text-muted-foreground"/>
                            <div>
                                <p className="font-medium">Contato</p>
                                <p className="text-muted-foreground">+91 88973 80712</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Floating Nav */}
            <div className="sticky bottom-4 w-full px-4">
                <div className="w-full max-w-sm mx-auto">
                    <Card className="shadow-2xl">
                        <CardContent className="p-2">
                            <div className="flex justify-around items-center">
                                <Button variant="secondary" className="flex-1 bg-primary/10 text-primary">
                                    <Building className="mr-2 h-4 w-4"/> Info
                                </Button>
                                <Button variant="ghost" className="flex-1">
                                    <StarIcon className="mr-2 h-4 w-4"/> Avaliações
                                </Button>
                                <Button variant="ghost" className="flex-1">
                                    <Camera className="mr-2 h-4 w-4"/> Fotos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
        </CardContent>
    </Card>
  );
}
