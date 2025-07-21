
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import imageCompression from 'browser-image-compression';
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
import type { Memory } from '@/contexts/finance-context';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';

const memorySchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
  imageUrl: z.string().optional(),
});

type MemoryFormData = z.infer<typeof memorySchema>;

type AddMemoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Memory, 'id'>) => void;
  memory?: Memory | null;
};

export function AddMemoryDialog({ isOpen, onClose, onSave, memory }: AddMemoryDialogProps) {
  const isEditing = !!memory;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      imageUrl: '',
    },
  });
  
  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (isOpen) {
      if (memory) {
        reset(memory);
        setImagePreview(memory.imageUrl || null);
      } else {
        reset({
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          imageUrl: '',
        });
        setImagePreview(null);
      }
    }
  }, [memory, isOpen, reset]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
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
            description: 'Não foi possível comprimir a imagem. Tente uma imagem diferente.',
        });
        setIsUploading(false);
      }
    }
  };

  const onSubmit = (data: MemoryFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Memória' : 'Adicionar Nova Memória'}</DialogTitle>
          <DialogDescription>
            Registre um momento especial na sua linha do tempo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            
            <div className="space-y-2">
                <Label>Foto do Momento (opcional)</Label>
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
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Camera className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? 'Enviando...' : (imageUrl ? 'Trocar Foto' : 'Adicionar Foto')}
                </Button>
                {imagePreview && (
                    <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
                        <Image src={imagePreview} alt="Pré-visualização da memória" layout="fill" objectFit="cover"/>
                    </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} placeholder="Ex: Nossa primeira viagem" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data do Acontecimento</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} placeholder="Descreva como foi esse momento..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Memória'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    