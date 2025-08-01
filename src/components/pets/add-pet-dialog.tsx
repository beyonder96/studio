
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pet } from '@/contexts/finance-context';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';


const petSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  species: z.enum(['cat', 'dog', 'other'], { required_error: 'A espécie é obrigatória' }),
  breed: z.string().optional(),
  birthDate: z.string().min(1, 'A data de nascimento é obrigatória'),
  microchip: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type PetFormData = z.infer<typeof petSchema>;

type AddPetDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Pet, 'id'>) => void;
  pet: Pet | null;
};

export function AddPetDialog({ isOpen, onClose, onSave, pet }: AddPetDialogProps) {
  const isEditing = !!pet;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (pet) {
        reset({
          ...pet,
          birthDate: format(parseISO(pet.birthDate), 'yyyy-MM-dd')
        });
        setImagePreview(pet.imageUrl || null);
      } else {
        reset({
          name: '',
          species: 'cat',
          breed: '',
          birthDate: format(new Date(), 'yyyy-MM-dd'),
          microchip: '',
          imageUrl: '',
        });
        setImagePreview(null);
      }
    }
  }, [pet, isOpen, reset]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setValue('imageUrl', result, { shouldValidate: true });
          setImagePreview(result);
          setIsUploading(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erro ao processar a imagem',
        });
        setIsUploading(false);
      }
    }
  };

  const onSubmit = (data: PetFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pet' : 'Adicionar Novo Pet'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do seu pet.' : 'Preencha os detalhes do seu novo amiguinho.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <div className="space-y-2">
                <Label>Foto do Pet (opcional)</Label>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Enviando...' : (imagePreview ? 'Trocar Foto' : 'Adicionar Foto')}
                </Button>
                {imagePreview && (
                    <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
                        <Image src={imagePreview} alt="Pré-visualização" layout="fill" objectFit="cover"/>
                    </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Churchill" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species">Espécie</Label>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="species">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat">Gato</SelectItem>
                        <SelectItem value="dog">Cachorro</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.species && <p className="text-red-500 text-xs mt-1">{errors.species.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça (opcional)</Label>
                <Input id="breed" {...register('breed')} placeholder="Ex: Sem Raça Definida" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input id="birthDate" type="date" {...register('birthDate')} />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="microchip">Nº do Microchip (opcional)</Label>
                    <Input id="microchip" {...register('microchip')} />
                </div>
            </div>
            
          </div>
          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Pet'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
