

'use client';

import { useState, useContext } from 'react';
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


export default function PetsPage() {
    const { pets, addPet, updatePet, deletePet, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useContext(FinanceContext);
    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
    const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [editingHealthRecord, setEditingHealthRecord] = useState<HealthRecord | null>(null);
    const [selectedPetForHealth, setSelectedPetForHealth] = useState<Pet | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<{petId: string, recordId: string} | null>(null);


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

    const handleDeletePet = (id: string) => {
        // Implement confirmation dialog before deleting
        deletePet(id);
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


    return (
        <>
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold">Nossos Pets</CardTitle>
                            <CardDescription>Acompanhe a saúde e os cuidados dos seus companheiros.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenPetDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Pet
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {pets.map(pet => (
                                    <motion.div
                                        key={pet.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <PetProfileCard 
                                            pet={pet}
                                            onEdit={() => handleOpenPetDialog(pet)} 
                                        />
                                        <PetHealthCard
                                            pet={pet}
                                            onAddRecord={() => handleOpenHealthDialog(pet)}
                                            onEditRecord={(record) => handleOpenHealthDialog(pet, record)}
                                            onDeleteRecord={(recordId) => setRecordToDelete({petId: pet.id, recordId})}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                            <Cat className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Nenhum pet cadastrado.</h3>
                            <p className="mt-1 text-sm">Adicione seu primeiro pet para começar.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
