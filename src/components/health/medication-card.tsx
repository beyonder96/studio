
'use client';

import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Medication, FinanceContext } from '@/contexts/finance-context';
import { Plus, Pill, Edit, Trash2 } from 'lucide-react';
import { AddMedicationDialog } from './add-medication-dialog';

type MedicationCardProps = {
  title: string;
  personKey: 'healthInfo1' | 'healthInfo2';
  medications: Medication[];
};

export function MedicationCard({ title, personKey, medications }: MedicationCardProps) {
  const { addMedication, updateMedication, deleteMedication } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const handleAddClick = () => {
    setEditingMedication(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (med: Medication) => {
    setEditingMedication(med);
    setIsDialogOpen(true);
  };
  
  const handleSave = (data: Omit<Medication, 'id'>) => {
    if (editingMedication) {
        updateMedication(personKey, { ...editingMedication, ...data });
    } else {
        addMedication(personKey, data);
    }
    setIsDialogOpen(false);
  }

  return (
    <>
      <Card className="bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length > 0 ? (
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="p-2 bg-muted rounded-full mt-1">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    <p className="text-xs text-muted-foreground">{med.frequency}</p>
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(med)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMedication(personKey, med.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground pt-4">
              Nenhum medicamento registrado.
            </p>
          )}
        </CardContent>
      </Card>
      <AddMedicationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        medication={editingMedication}
      />
    </>
  );
}
