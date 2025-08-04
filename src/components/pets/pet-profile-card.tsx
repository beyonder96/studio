

'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pet } from '@/contexts/finance-context';
import { differenceInYears, differenceInMonths, parseISO, format } from 'date-fns';
import { Cake, Cat, Dog, MoreVertical, PawPrint, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '../ui/badge';

const getPetAge = (birthDate: string): string => {
    const now = new Date();
    const dob = parseISO(birthDate);
    const years = differenceInYears(now, dob);
    if (years > 0) return `${years} ano${years > 1 ? 's' : ''}`;
    
    const months = differenceInMonths(now, dob);
    return `${months} mese${months > 1 ? 's' : ''}`;
}

const getPetIcon = (species: 'cat' | 'dog' | 'other') => {
    switch (species) {
        case 'cat': return <Cat className="h-4 w-4" />;
        case 'dog': return <Dog className="h-4 w-4" />;
        default: return <PawPrint className="h-4 w-4" />;
    }
}

export function PetProfileCard({ pet, onEdit }: { pet: Pet, onEdit: () => void }) {
  
  return (
    <Card className="flex flex-col card-hover-effect bg-transparent">
      <CardHeader className="p-0 relative">
        <div className="relative w-full h-48">
            <Image
                src={pet.imageUrl || "https://placehold.co/600x400.png"}
                alt={pet.name}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint="cat dog pet"
            />
        </div>
        <div className="absolute top-2 right-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" disabled>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2">{pet.name}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                {getPetIcon(pet.species)}
                <span>{pet.breed || 'SRD'}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                <Cake className="h-4 w-4"/>
                <span>{getPetAge(pet.birthDate)}</span>
            </Badge>
            {pet.neutered && (
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 text-blue-500 border-blue-500/20">
                    <ShieldCheck className="h-4 w-4"/>
                    <span>Castrado</span>
                </Badge>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
