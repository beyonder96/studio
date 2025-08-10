
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyProvider, useProperty, Room } from '@/contexts/property-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Home, Building, HardHat, PlusCircle, DoorOpen } from 'lucide-react';
import Image from 'next/image';
import { AddPropertyDialog } from '@/components/home/add-property-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ConstructionProgress } from '@/components/home/construction-progress';
import { PropertyDocuments } from '@/components/home/property-documents';
import { RoomCard } from '@/components/home/room-card';
import { AddRoomDialog } from '@/components/home/add-room-dialog';
import { motion, AnimatePresence } from 'framer-motion';

const typeDetails = {
    house: { icon: <Home className="h-5 w-5 text-muted-foreground"/>, label: 'Casa (Residência)' },
    apartment: { icon: <Building className="h-5 w-5 text-muted-foreground"/>, label: 'Apartamento (Pronto)' },
    construction: { icon: <HardHat className="h-5 w-5 text-muted-foreground"/>, label: 'Apartamento (Em Construção)' },
};

function PropertyDetailPageContent() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.propertyId as string;
    
    const { 
        getPropertyById,
        setEditingProperty,
        setIsAddDialogOpen,
        deleteProperty,
        addRoom,
    } = useProperty();

    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const property = getPropertyById(propertyId);

    useEffect(() => {
        if (!property) {
            // Can handle loading state here or redirect
        }
    }, [property, propertyId, router]);

    const handleEdit = () => {
        if (property) {
            setEditingProperty(property);
            setIsAddDialogOpen(true);
        }
    };
    
    const handleDelete = () => {
        if (property) {
            deleteProperty(property.id, () => {
                router.push('/home');
            });
        }
    };
    
    const handleAddRoom = (roomName: string) => {
        if (property) {
            addRoom(property.id, roomName);
            setIsRoomDialogOpen(false);
        }
    };

    if (!property) {
        return <div className="flex items-center justify-center h-full">Carregando detalhes do imóvel...</div>;
    }

    const { icon, label } = typeDetails[property.type];

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => router.push('/home')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Imóveis
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Imóvel?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja excluir o imóvel "{property.name}"? Esta ação não pode ser desfeita e todos os dados associados a ele serão perdidos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        Sim, Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="relative w-full h-48 md:h-64 bg-muted">
                        <Image 
                            src={property.imageUrl || "https://placehold.co/1200x400.png"}
                            alt={property.name}
                            fill
                            className="object-cover"
                            data-ai-hint="house apartment building"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{property.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2">
                           {icon} {label}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground pt-1">{property.address}</p>
                    </CardHeader>
                </Card>

                {property.type === 'construction' && (
                    <ConstructionProgress property={property} />
                )}

                 <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><DoorOpen/> Cômodos</CardTitle>
                             <Button variant="outline" size="sm" onClick={() => setIsRoomDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cômodo
                            </Button>
                        </div>
                         <CardDescription>
                            Gerencie os itens e o planejamento para cada cômodo do seu imóvel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {property.rooms?.map((room) => (
                                    <motion.div key={room.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                                        <RoomCard propertyId={property.id} room={room} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                             {(!property.rooms || property.rooms.length === 0) && (
                                <p className="text-center text-muted-foreground py-10 md:col-span-2 lg:col-span-3">Nenhum cômodo adicionado ainda.</p>
                            )}
                        </div>
                    </CardContent>
                 </Card>

                 <PropertyDocuments property={property} />
            </div>
            <AddPropertyDialog />
            <AddRoomDialog 
                isOpen={isRoomDialogOpen}
                onClose={() => setIsRoomDialogOpen(false)}
                onSave={handleAddRoom}
            />
        </>
    );
}

export default function PropertyDetailPage() {
    return (
        <PropertyProvider>
            <PropertyDetailPageContent />
        </PropertyProvider>
    )
}
