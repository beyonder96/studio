
'use client';

import { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property, PropertyShoppingItem, useProperty } from '@/contexts/property-context';
import { PlusCircle, ShoppingCart, Sofa, Refrigerator, Lamp, Hammer, MoreHorizontal } from 'lucide-react';
import { AddPropertyItemDialog } from './add-property-item-dialog';
import { cn } from '@/lib/utils';

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
    purchased: { label: 'Comprado', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export function PropertyShoppingList({ property }: { property: Property }) {
    const { addShoppingItem, updateShoppingItem, deleteShoppingItem } = useProperty();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PropertyShoppingItem | null>(null);

    const handleOpenAddDialog = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };
    
    const handleOpenEditDialog = (item: PropertyShoppingItem) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleSaveItem = (data: Omit<PropertyShoppingItem, 'id'>) => {
        if (editingItem) {
            updateShoppingItem(property.id, editingItem.id, data);
        } else {
            addShoppingItem(property.id, data);
        }
        setIsDialogOpen(false);
    };

    const items = property.shoppingItems || [];

    return (
        <>
            <Card className="bg-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                           <ShoppingCart /> Lista de Compras
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenAddDialog}>
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 h-60 overflow-y-auto">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => handleOpenEditDialog(item)}>
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">{categoryMap[item.category].icon} {categoryMap[item.category].label}</div>
                                        <span>•</span>
                                        <span>R$ {item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn(statusMap[item.status].className)}>
                                    {statusMap[item.status].label}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-10">Nenhum item na lista.</p>
                    )}
                </CardContent>
            </Card>
            <AddPropertyItemDialog 
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveItem}
                item={editingItem}
                propertyId={property.id}
            />
        </>
    );
}
