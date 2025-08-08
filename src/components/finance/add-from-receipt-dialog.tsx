// src/components/finance/add-from-receipt-dialog.tsx

'use client';

import { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FinanceContext } from '@/contexts/finance-context';

export function AddFromReceiptDialog({ onReceiptProcessed }: { onReceiptProcessed: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleProcessReceipt = async () => {
    if (!file) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('receiptImage', file);

    try {
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha na resposta da API');
      }
      
      toast({ title: "Cupom lido com sucesso!", description: `${data.storeName} - R$ ${data.total.toFixed(2)}` });
      onReceiptProcessed(data); // Envia os dados extraídos para a página de finanças
      setOpen(false); // Fecha este diálogo

    } catch (error) {
      console.error('Erro ao processar o recibo:', error);
      toast({ variant: 'destructive', title: "Erro ao ler cupom", description: "Não foi possível analisar a imagem. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Receipt className="mr-2 h-4 w-4" />
          Adicionar por Cupom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa por Cupom</DialogTitle>
          <DialogDescription>
            Envie a foto do seu cupom fiscal e deixe a IA preencher os dados para você.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Foto do Cupom</Label>
            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleProcessReceipt} disabled={!file || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Analisando...' : 'Analisar Cupom'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
