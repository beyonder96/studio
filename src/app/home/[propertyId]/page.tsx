
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProperty, PropertyProvider } from '@/contexts/property-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Home, Building, HardHat, FileText, Wrench } from 'lucide-react';
import Image from 'next/image';
import { AddPropertyDialog } from '@/components/home/add-property-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PropertyShoppingList } from '@/components/home/property-shopping-list';
import { ConstructionProgress } from '@/components/home/construction-progress';
import { PropertyDocuments } from '@/components/home/property-documents';

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
    } = useProperty();

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

    if (!property) {
        return <div className="flex items-center justify-center h-full">Carregando detalhes do imóvel...</div>;
    }

    const { icon, label } = typeDetails[property.type];

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
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
                    <div className="relative w-full h-64 bg-muted">
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PropertyShoppingList property={property} />
                        <PropertyDocuments property={property} />
                         <Card className="bg-transparent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wrench /> Reformas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Em breve: acompanhe os projetos de reforma e manutenção.</p>
                            </CardContent>
                        </Card>
                        {property.type === 'construction' && (
                            <ConstructionProgress property={property} />
                        )}
                    </CardContent>
                </Card>
            </div>
            <AddPropertyDialog />
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
