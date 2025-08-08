
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@/contexts/property-context';
import { Home, Building, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';

const typeDetails = {
    house: { icon: <Home className="h-5 w-5 text-muted-foreground"/>, label: 'Casa' },
    apartment: { icon: <Building className="h-5 w-5 text-muted-foreground"/>, label: 'Apartamento' },
    construction: { icon: <HardHat className="h-5 w-5 text-muted-foreground"/>, label: 'Em Construção' },
}

export function PropertyCard({ property, onClick }: { property: Property, onClick: () => void }) {
  const { icon, label } = typeDetails[property.type];

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
        <Card className="flex flex-col bg-transparent cursor-pointer h-full" onClick={onClick}>
        <CardHeader className="p-0">
            <div className="relative w-full h-48">
                <Image
                    src={property.imageUrl || "https://placehold.co/600x400.png"}
                    alt={property.name}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint="house apartment building"
                />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <CardDescription className="text-sm truncate">{property.address}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
        </CardFooter>
        </Card>
    </motion.div>
  );
}
