
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
import { ShoppingList, ShoppingListItem } from '@/app/purchases/page';
import { generateShoppingList } from '@/ai/flows/generate-shopping-list-flow';
import { Sparkles, Trash2 } from 'lucide-react';

type CreateListDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (list: Omit<ShoppingList, 'id'>) => void;
};

export function CreateListDialog({ isOpen, onClose, onSave }: CreateListDialogProps) {
  const [listName, setListName] = useState('');
  const [items, setItems] = useState<Omit<ShoppingListItem, 'id' | 'checked'>[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateList = async () => {
    if (!pastedText) return;
    setIsGenerating(true);
    try {
      const result = await generateShoppingList({ text: pastedText });
      if (result && result.items) {
        setItems(result.items);
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      // Here you could show a toast to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity' && typeof value === 'string') {
        newItems[index][field] = parseInt(value, 10) || 1;
    } else if (field === 'name' && typeof value === 'string') {
        newItems[index][field] = value;
    }
    setItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }

  const handleSave = () => {
    if (!listName) return;
    const newList: Omit<ShoppingList, 'id'> = {
      name: listName,
      items: items.map((item) => ({ ...item, id: crypto.randomUUID(), checked: false })),
    };
    onSave(newList);
    handleClose();
  };

  const handleClose = () => {
    setListName('');
    setItems([]);
    setPastedText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Lista de Compras</DialogTitle>
          <DialogDescription>
            Digite um nome para sua lista e adicione itens manualmente ou cole um texto para a IA gerar a lista.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="list-name" className="text-right">
                    Nome
                </Label>
                <Input
                    id="list-name"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="col-span-3"
                    placeholder="Ex: Supermercado"
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="pasted-text" className="text-right pt-2">
                    Colar Texto
                </Label>
                <div className="col-span-3 space-y-2">
                    <Textarea
                        id="pasted-text"
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Ex: 2L de leite, 1 dúzia de ovos, pão de forma"
                        rows={4}
                    />
                    <Button onClick={handleGenerateList} disabled={isGenerating || !pastedText} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Gerando...' : 'Gerar Lista com IA'}
                    </Button>
                </div>
            </div>

            <div className="col-span-4">
                <Label className="mb-2 block font-medium">Itens</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-20"
                                min="1"
                            />
                            <Input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                placeholder="Nome do item"
                                className="flex-1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <Button onClick={handleAddItem} variant="outline" className="mt-2 w-full">
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
          <Button type="button" onClick={handleSave} disabled={!listName || items.length === 0}>
            Salvar Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
