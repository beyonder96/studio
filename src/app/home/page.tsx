
'use client';

import { useContext } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyProvider, PropertyContext } from '@/contexts/property-context';
import { AddPropertyDialog } from '@/components/home/add-property-dialog';
import { PropertyCard } from '@/components/home/property-card';
import { useRouter } from 'next/navigation';

function HomePageContent() {
  const { properties, isAddDialogOpen, setIsAddDialogOpen } = useContext(PropertyContext);
  const router = useRouter();

  const handleCardClick = (propertyId: string) => {
    router.push(`/home/${propertyId}`);
  };

  return (
    <>
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Imóveis</h1>
                <p className="text-muted-foreground">Selecione um imóvel para gerenciar ou adicione um novo.</p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Imóvel
              </Button>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(prop => (
                  <PropertyCard key={prop.id} property={prop} onClick={() => handleCardClick(prop.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <h3 className="mt-4 text-lg font-medium">Nenhum imóvel cadastrado.</h3>
                <p className="mt-1 text-sm">Adicione seu primeiro imóvel para começar a gerenciar.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AddPropertyDialog />
    </>
  );
}


export default function HomePage() {
    return (
        <PropertyProvider>
            <HomePageContent />
        </PropertyProvider>
    )
}
