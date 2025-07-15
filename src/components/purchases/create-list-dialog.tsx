
'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateShoppingList, GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list-flow';
import { Loader2, Plus, Trash2 } from 'lucide-react';

type NewListItem = {
    name: string;
    quantity: number;
};

type CreateListDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (list: { name: string; items: NewListItem[] }) => void;
};

export function CreateListDialog({ isOpen, onClose, onCreateList }: CreateListDialogProps) {
  const [listName, setListName] = useState('');
  const [textToParse, setTextToParse] = useState('');
  const [newItems, setNewItems] = useState<NewListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateList = async () => {
    if (!textToParse) return;
    setIsGenerating(true);
    try {
      const result: GenerateShoppingListOutput = await generateShoppingList({ text: textToParse });
      setNewItems(prev => [...prev, ...result.items]);
      setTextToParse('');
    } catch (error) {
      console.error("Error generating shopping list:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNewItem = () => {
    setNewItems(prev => [...prev, { name: '', quantity: 1 }]);
  };

  const handleNewItemChange = (index: number, field: keyof NewListItem, value: string | number) => {
    const updatedItems = [...newItems];
    if (typeof updatedItems[index][field] === 'number' && typeof value === 'string') {
        updatedItems[index][field] = parseInt(value, 10) || 0 as never;
    } else {
        updatedItems[index][field] = value as never;
    }
    setNewItems(updatedItems);
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };


  const handleSave = () => {
    if (listName && newItems.length > 0) {
      onCreateList({ name: listName, items: newItems });
      handleClose();
    }
  };

  const handleClose = () => {
    setListName('');
    setTextToParse('');
    setNewItems([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Nova Lista de Compras</DialogTitle>
          <DialogDescription>
            Dê um nome para sua lista e adicione itens usando a IA ou manualmente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="list-name">
              Nome da Lista
            </Label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Supermercado do Mês"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-to-parse">Cole sua lista aqui</Label>
            <Textarea
              id="text-to-parse"
              value={textToParse}
              onChange={(e) => setTextToParse(e.target.value)}
              placeholder="Ex: 2 pacotes de arroz, 1kg de carne, cebola..."
              rows={4}
            />
            <Button onClick={handleGenerateList} disabled={!textToParse || isGenerating} className="w-full">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? 'Gerando...' : 'Gerar Itens com IA'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Itens da Lista</Label>
            {newItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
            ) : (
                <div className="space-y-2">
                    {newItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleNewItemChange(index, 'quantity', e.target.value)}
                                className="w-20"
                                min="1"
                            />
                            <Input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleNewItemChange(index, 'name', e.target.value)}
                                placeholder="Nome do item"
                                className="flex-1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveNewItem(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
             <Button variant="outline" onClick={handleAddNewItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item Manualmente
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!listName || newItems.length === 0}>
            Criar Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
