
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Room, useProperty, PropertyShoppingItem } from '@/contexts/property-context';
import { PlusCircle, Sofa, Refrigerator, Lamp, Hammer, MoreHorizontal, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { AddPropertyItemDialog } from './add-property-item-dialog';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categoryMap = {
    furniture: { label: 'Móveis', icon: <Sofa className="h-4 w-4" /> },
    appliances: { label: 'Eletrodomésticos', icon: <Refrigerator className="h-4 w-4" /> },
    decor: { label: 'Decoração', icon: <Lamp className="h-4 w-4" /> },
    materials: { label: 'Materiais', icon: <Hammer className="h-4 w-4" /> },
    other: { label: 'Outros', icon: <MoreHorizontal className="h-4 w-4" /> },
};

const statusMap = {
    needed: { label: 'A Comprar', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    researching: { label: 'Pesquisando', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    purchased: { label: 'Comprado', className: 'bg-green-600/10 text-green-600 border-green-600/20' },
};


export function RoomCard({ propertyId, room }: { propertyId: string, room: Room }) {
    const { addShoppingItem, updateShoppingItem, deleteRoom } = useProperty();
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PropertyShoppingItem | null>(null);
    const [isListOpen, setIsListOpen] = useState(true);

    const handleOpenAddItemDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingItem(null);
        setIsItemDialogOpen(true);
    };

    const handleOpenEditItemDialog = (e: React.MouseEvent, item: PropertyShoppingItem) => {
        e.stopPropagation();
        setEditingItem(item);
        setIsItemDialogOpen(true);
    };

    const handleSaveItem = (data: Omit<PropertyShoppingItem, 'id'>) => {
        if (editingItem) {
            updateShoppingItem(propertyId, room.id, editingItem.id, data);
        } else {
            addShoppingItem(propertyId, room.id, data);
        }
        setIsItemDialogOpen(false);
    };
    
    const handleDeleteRoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteRoom(propertyId, room.id);
    };

    const items = room.items || [];
    const totalCost = items.filter(item => item.status === 'purchased').reduce((sum, item) => sum + item.price, 0);

    return (
        <>
        <Collapsible open={isListOpen} onOpenChange={setIsListOpen}>
            <Card className="bg-transparent flex flex-col h-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <CollapsibleTrigger asChild>
                            <div className="flex-1 cursor-pointer">
                                <CardTitle>{room.name}</CardTitle>
                                <CardDescription>{items.length} item(s)</CardDescription>
                            </div>
                        </CollapsibleTrigger>
                         <div className="flex items-center gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleOpenAddItemDialog}>
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                             <AlertDialog onOpenChange={(e) => e.stopPropagation()}>
                                <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Cômodo?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir o cômodo "{room.name}" e todos os seus itens? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive hover:bg-destructive/90">
                                            Sim, Excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                    </div>
                </CardHeader>
                <CollapsibleContent asChild>
                    <CardContent className="space-y-3 flex-grow">
                        {items.length > 0 ? (
                            items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={(e) => handleOpenEditItemDialog(e, item)}>
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>R$ {item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn("text-xs", statusMap[item.status].className)}>
                                        {statusMap[item.status].label}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-10">Nenhum item adicionado.</p>
                        )}
                    </CardContent>
                </CollapsibleContent>
                {totalCost > 0 && (
                     <CardFooter className="pt-4">
                        <p className="text-sm text-muted-foreground w-full text-right">
                            Custo Total (Comprados): <span className="font-bold text-foreground">R$ {totalCost.toFixed(2)}</span>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </Collapsible>
        <AddPropertyItemDialog
            isOpen={isItemDialogOpen}
            onClose={() => setIsItemDialogOpen(false)}
            onSave={handleSaveItem}
            item={editingItem}
            propertyId={propertyId}
            roomId={room.id}
        />
        </>
    );
}
