
'use client';

import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Cat } from 'lucide-react';
import { AddPetDialog } from '@/components/pets/add-pet-dialog';
import { PetProfileCard } from '@/components/pets/pet-profile-card';
import { FinanceContext } from '@/contexts/finance-context';
import type { Pet } from '@/contexts/finance-context';


export default function PetsPage() {
    const { pets, addPet, updatePet, deletePet } = useContext(FinanceContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);

    const handleOpenDialog = (pet: Pet | null = null) => {
        setEditingPet(pet);
        setIsDialogOpen(true);
    };

    const handleSavePet = (data: Omit<Pet, 'id'>) => {
        if (editingPet) {
            updatePet(editingPet.id, data);
        } else {
            addPet(data);
        }
        setIsDialogOpen(false);
    };

    const handleDeletePet = (id: string) => {
        // Implement confirmation dialog before deleting
        deletePet(id);
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
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Pet
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pets.map(pet => (
                                <PetProfileCard 
                                    key={pet.id} 
                                    pet={pet}
                                    onEdit={() => handleOpenDialog(pet)} 
                                />
                            ))}
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
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSavePet}
                pet={editingPet}
            />
        </>
    )
}
