
'use client';

import { useState, useContext } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, CheckCircle2, Gift, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { FinanceContext, Wish } from '@/contexts/finance-context';
import { AddWishDialog } from '@/components/wishes/add-wish-dialog';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function WishesPage() {
  const { wishes, addWish, updateWish, deleteWish, toggleWishPurchased, formatCurrency } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [wishToDelete, setWishToDelete] = useState<Wish | null>(null);
  
  const openAddDialog = () => {
    setEditingWish(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (wish: Wish) => {
    setEditingWish(wish);
    setIsDialogOpen(true);
  };

  const handleSaveWish = (data: Omit<Wish, 'id' | 'purchased'>) => {
    if (editingWish) {
      updateWish(editingWish.id, data);
    } else {
      addWish(data);
    }
    setIsDialogOpen(false);
    setEditingWish(null);
  };
  
  const handleDelete = () => {
    if (wishToDelete) {
      deleteWish(wishToDelete.id);
      setWishToDelete(null);
    }
  };
  
  const pendingWishes = wishes.filter(w => !w.purchased);
  const purchasedWishes = wishes.filter(w => w.purchased);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lista de Desejos</h1>
          <p className="text-muted-foreground">Planejem e conquistem seus sonhos juntos.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Desejo
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Desejos Atuais
        </h2>
        {pendingWishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingWishes.map(wish => (
                <Card key={wish.id} className="flex flex-col">
                    <CardHeader className="relative p-0">
                         <Image
                            src={wish.imageUrl || "https://placehold.co/600x400.png"}
                            alt={wish.name}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover rounded-t-2xl"
                            data-ai-hint="product gift"
                        />
                         <div className="absolute top-2 right-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(wish)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => toggleWishPurchased(wish.id)}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Marcar como comprado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => setWishToDelete(wish)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-lg mb-2">{wish.name}</CardTitle>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-base font-bold text-primary">
                                {formatCurrency(wish.price)}
                            </Badge>
                             {wish.link && (
                                <a href={wish.link} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon">
                                        <LinkIcon className="h-5 w-5" />
                                    </Button>
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <h3 className="mt-4 text-lg font-medium">Nenhum desejo na lista.</h3>
                <p className="mt-1 text-sm">Adicione algo que vocês gostariam de comprar!</p>
            </div>
        )}
      </div>
      
       <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          Conquistas
        </h2>
        {purchasedWishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedWishes.map(wish => (
                    <Card key={wish.id} className="relative opacity-70">
                         <Image
                            src={wish.imageUrl || "https://placehold.co/600x400.png"}
                            alt={wish.name}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover rounded-2xl brightness-50"
                            data-ai-hint="product gift"
                        />
                        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                             <div>
                                <h3 className="text-lg font-bold">{wish.name}</h3>
                                <p className="font-mono text-sm">{formatCurrency(wish.price)}</p>
                            </div>
                            <Badge variant="secondary" className="w-fit bg-green-500/80 text-white border-0">
                                Comprado!
                            </Badge>
                        </div>
                         <div className="absolute top-2 right-2">
                            <Button variant="ghost" size="icon" onClick={() => setWishToDelete(wish)} className="text-white hover:bg-black/50 hover:text-white">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <h3 className="mt-4 text-lg font-medium">Nenhuma conquista ainda.</h3>
                <p className="mt-1 text-sm">Quando marcarem um desejo como comprado, ele aparecerá aqui.</p>
            </div>
        )}
       </div>

      <AddWishDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingWish(null); }}
        onSave={handleSaveWish}
        wish={editingWish}
      />
      
       <AlertDialog open={!!wishToDelete} onOpenChange={(open) => !open && setWishToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá excluir permanentemente o desejo
                        <span className="font-semibold"> "{wishToDelete?.name}"</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setWishToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
