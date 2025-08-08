
// src/app/api/process-receipt/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { run } from 'genkit';
import { processReceiptFlow } from '@/ai/flows/process-receipt-flow';
import { z } from 'zod';

// Nota: O Genkit é inicializado automaticamente pelo Next.js plugin.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('receiptImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida.' }, { status: 400 });
    }
    
    // Converte o arquivo para o formato que o Genkit espera (base64)
    const imageBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    const mediaPart = {
      media: {
        url: `data:${file.type};base64,${base64Image}`,
        contentType: file.type
      }
    };
    
    // Executa nosso novo flow com a imagem
    const result = await run(processReceiptFlow, { image: mediaPart });

    // Retorna o JSON extraído para o frontend
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar o recibo:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'A IA retornou um formato inesperado.', details: error.errors }, { status: 500 });
    }
    return NextResponse.json({ error: 'Falha ao processar a imagem do recibo.' }, { status: 500 });
  }
}
