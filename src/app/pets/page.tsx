
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Cat } from 'lucide-react';
import { AddPetDialog } from '@/components/pets/add-pet-dialog';
import { PetProfileCard } from '@/components/pets/pet-profile-card';
import { FinanceContext } from '@/contexts/finance-context';
import type { Pet, HealthRecord } from '@/contexts/finance-context';
import { AnimatePresence, motion } from 'framer-motion';
import { PetHealthCard } from '@/components/pets/pet-health-card';
import { AddHealthRecordDialog } from '@/components/pets/add-health-record-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';


export default function PetsPage() {
    const { pets, addPet, updatePet, deletePet, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useContext(FinanceContext);
    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
    const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [editingHealthRecord, setEditingHealthRecord] = useState<HealthRecord | null>(null);
    const [selectedPetForHealth, setSelectedPetForHealth] = useState<Pet | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<{petId: string, recordId: string} | null>(null);
    
    const [api, setApi] = useState<CarouselApi>();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCurrentItemIndex(api.selectedScrollSnap());
        const onSelect = () => {
        setCurrentItemIndex(api.selectedScrollSnap());
        };
        api.on('select', onSelect);
        return () => {
        api.off('select', onSelect);
        };
    }, [api]);

    const selectedPet = useMemo(() => pets[currentItemIndex], [pets, currentItemIndex]);


    const handleOpenPetDialog = (pet: Pet | null = null) => {
        setEditingPet(pet);
        setIsPetDialogOpen(true);
    };
    
    const handleOpenHealthDialog = (pet: Pet, record: HealthRecord | null = null) => {
        setSelectedPetForHealth(pet);
        setEditingHealthRecord(record);
        setIsHealthDialogOpen(true);
    };

    const handleSavePet = (data: Omit<Pet, 'id'>) => {
        if (editingPet) {
            updatePet(editingPet.id, data);
        } else {
            addPet(data);
        }
        setIsPetDialogOpen(false);
    };
    
    const handleSaveHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
        if (selectedPetForHealth) {
            if (editingHealthRecord) {
                updateHealthRecord(selectedPetForHealth.id, { ...editingHealthRecord, ...record });
            } else {
                addHealthRecord(selectedPetForHealth.id, record);
            }
        }
        setIsHealthDialogOpen(false);
    }
    
    const handleDeleteRecordConfirm = () => {
        if(recordToDelete){
            deleteHealthRecord(recordToDelete.petId, recordToDelete.recordId);
            setRecordToDelete(null);
        }
    }
    
    if (pets.length === 0) {
        return (
            <>
                <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
                    <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
                        <Cat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold">Nenhum pet cadastrado.</h2>
                        <p className="text-muted-foreground mt-2">Adicione seu primeiro pet para começar.</p>
                        <Button className="mt-6" onClick={() => handleOpenPetDialog()}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Adicionar Pet
                        </Button>
                    </CardContent>
                </Card>
                 <AddPetDialog 
                    isOpen={isPetDialogOpen}
                    onClose={() => setIsPetDialogOpen(false)}
                    onSave={handleSavePet}
                    pet={editingPet}
                />
            </>
        )
    }


    return (
        <>
             <div className="space-y-6">
                 <div className="flex justify-end">
                    <Button onClick={() => handleOpenPetDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Pet
                    </Button>
                </div>

                <Carousel setApi={setApi} className="w-full max-w-md mx-auto">
                    <CarouselContent>
                    {pets.map((pet) => (
                        <CarouselItem key={pet.id}>
                            <PetProfileCard 
                                pet={pet}
                                onEdit={() => handleOpenPetDialog(pet)} 
                            />
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                </Carousel>
                
                 <AnimatePresence mode="wait">
                    {selectedPet && (
                        <motion.div
                            key={selectedPet ? selectedPet.id : 'empty'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                             <PetHealthCard
                                pet={selectedPet}
                                onAddRecord={() => handleOpenHealthDialog(selectedPet)}
                                onEditRecord={(record) => handleOpenHealthDialog(selectedPet, record)}
                                onDeleteRecord={(recordId) => setRecordToDelete({petId: selectedPet.id, recordId})}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AddPetDialog 
                isOpen={isPetDialogOpen}
                onClose={() => setIsPetDialogOpen(false)}
                onSave={handleSavePet}
                pet={editingPet}
            />
            {selectedPetForHealth && (
                 <AddHealthRecordDialog
                    isOpen={isHealthDialogOpen}
                    onClose={() => setIsHealthDialogOpen(false)}
                    onSave={handleSaveHealthRecord}
                    pet={selectedPetForHealth}
                    record={editingHealthRecord}
                />
            )}
             <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Registro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este registro de saúde? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRecordConfirm} className="bg-destructive hover:bg-destructive/90">
                            Sim, Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
