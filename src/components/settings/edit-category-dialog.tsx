
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EditCategoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldName: string, newName: string) => void;
  category: { type: string; name: string } | null;
};

export function EditCategoryDialog({ isOpen, onClose, onSave, category }: EditCategoryDialogProps) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (category) {
      setNewName(category.name);
    }
  }, [category]);

  const handleSave = () => {
    if (category && newName.trim()) {
      onSave(category.name, newName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
           <DialogDescription>
            Renomeie a categoria "{category?.name}". A alteração será aplicada em todos os itens associados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Novo nome da categoria</Label>
            <Input
              id="category-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={!newName.trim() || newName.trim() === category?.name}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
