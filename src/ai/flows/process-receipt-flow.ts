
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Definimos a estrutura exata que a IA deve nos retornar
const ReceiptDataSchema = z.object({
  storeName: z.string().describe('O nome do estabelecimento. Se não encontrar, retorne "Não identificado".'),
  purchaseDate: z.string().describe('A data da compra no formato YYYY-MM-DD. Tente encontrar, se não, use a data atual.'),
  total: z.number().describe('O valor TOTAL pago na compra. Procure por "Total", "Valor a Pagar", etc.'),
  items: z.array(z.object({
    description: z.string().describe('A descrição do item comprado.'),
    quantity: z.number().describe('A quantidade. Se não for explícita, assuma 1.'),
    price: z.number().describe('O preço total do item (quantidade x valor unitário).'),
  })).optional().describe('Uma lista de todos os itens do recibo. Se for muito difícil extrair, pode ser uma lista vazia.'),
});
export type ReceiptData = z.infer<typeof ReceiptDataSchema>;


export const processReceiptFlow = ai.defineFlow(
  {
    name: 'processReceiptFlow',
    inputSchema: z.object({ image: z.any() }), // A entrada será uma imagem
    outputSchema: ReceiptDataSchema, // A saída será nosso JSON estruturado
    model: 'googleai/gemini-2.5-flash',
  },
  async ({ image }) => {
    
    const llmResponse = await ai.generate({
      prompt: `
        Você é um assistente financeiro especialista em análise de documentos fiscais.
        Sua tarefa é extrair as informações de um cupom fiscal com a máxima precisão.
        Analise a imagem fornecida e extraia os dados estritamente no formato JSON solicitado.
        Foque principalmente no nome do estabelecimento, data da compra e valor total.
        Se a lista de itens for complexa, não há problema em retorná-la vazia.
      `,
      input: {
        image: image
      },
      output: {
        format: 'json',
        schema: ReceiptDataSchema,
      },
    });

    return llmResponse.output()!;
  }
);
