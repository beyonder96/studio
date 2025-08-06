
'use server';
/**
 * @fileOverview A general-purpose command processing flow for the AI assistant.
 *
 * - processChat - A function that interprets a user's text command and executes the appropriate tool.
 * - ProcessChatInput - The input type for the processChat function.
 * - ProcessChatOutput - The return type for the processChat function.
 */

import { ai } from '@/ai/genkit';
import { addTransaction, createCalendarEvent, createTask, addItemToShoppingList, getTransactions } from '../tools/app-tools';
import { ProcessChatInput, ProcessChatOutput, ProcessChatInputSchema, ProcessChatOutputSchema } from './schemas/process-chat-schema';
import { format } from 'date-fns';


export async function processChat(input: ProcessChatInput): Promise<ProcessChatOutput> {
  const flowInput = {
    ...input,
    context: {
      ...input.context,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
    },
  };
  return processChatFlow(flowInput);
}

const processChatFlow = ai.defineFlow(
  {
    name: 'processChatFlow',
    inputSchema: ProcessChatInputSchema,
    outputSchema: ProcessChatOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        tools: [addTransaction, createTask, createCalendarEvent, addItemToShoppingList, getTransactions],
        toolChoice: 'auto',
        prompt: `Você é o "Copilot Vida a 2", um assistente de IA para casais, integrado a um aplicativo de gerenciamento de vida.
          Sua principal função é executar ações práticas dentro do aplicativo com base nos comandos do usuário.
          Seja direto, prático e eficiente.

          FERRAMENTAS DISPONÍVEIS:
          - 'addTransaction': Para adicionar despesas ou receitas. Requer valor, descrição e data.
          - 'createTask': Para adicionar uma tarefa à lista de afazeres.
          - 'createCalendarEvent': Para agendar um compromisso no calendário.
          - 'addItemToShoppingList': Para adicionar um ou mais itens à lista de compras. Pode receber múltiplos itens de uma vez.
          - 'getTransactions': Para responder a perguntas sobre gastos e transações.

          COMO AGIR:
          1. ANALISE o comando do usuário para identificar a intenção.
          2. SELECIONE a ferramenta mais apropriada.
          3. EXTRAIA as informações necessárias (ex: nome do item, valor da despesa).
          4. SE UMA INFORMAÇÃO ESSENCIAL ESTIVER FALTANDO (ex: valor da despesa), peça ao usuário de forma clara e direta. Ex: "Claro, qual o valor da despesa com gasolina?"
          5. NÃO responda de forma conversacional se uma ação puder ser executada. Execute a ação.
          6. SEMPRE passe o 'userId' para a ferramenta que você chamar.

          EXEMPLOS DE COMANDOS:
          - "adicione leite e pão na lista de compras" -> Deve usar 'addItemToShoppingList' com os itens ["leite", "pão"].
          - "gastei 50 reais no outback" -> Deve usar 'addTransaction' com amount: 50, description: "Outback". A data deve ser hoje.
          - "adicionar tarefa: limpar a casa" -> Deve usar 'createTask'.
          - "quanto gastei com iFood em agosto de 2024?" -> Deve usar 'getTransactions' com descriptionQuery: "iFood", month: 8, year: 2024.

          Se o comando não corresponder a nenhuma ferramenta, responda de forma útil como um assistente geral.

          Contexto Disponível:
          - Data Atual: ${input.context?.currentDate} (use isso para resolver datas relativas como 'hoje' ou 'amanhã').
          
          Comando do usuário: "${input.command}"
        `,
    });

    const toolRequests = llmResponse.toolRequests;

    if (toolRequests.length > 0) {
        // Right now, only process the first tool request for simplicity.
        const toolRequest = toolRequests[0];
        const toolResult = await toolRequest.run({ userId: input.userId });
        
        let answer = "Ação executada com sucesso!";

        if(toolRequest.name === 'getTransactions') {
          const transactions = toolResult as any[];
          if(transactions.length === 0) {
            answer = "Não encontrei nenhuma transação com esses critérios."
          } else {
            const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const items = transactions.map(t => `- ${t.description}: R$ ${Math.abs(t.amount).toFixed(2)}`).join('\n');
            answer = `Encontrei ${transactions.length} transação(ões), totalizando R$ ${total.toFixed(2)}:\n${items}`;
          }
        } else if (typeof toolResult === 'object' && toolResult && 'message' in toolResult) {
            answer = (toolResult as any).message;
        }

        return { answer };
    }
    
    // If no tool was called, return the text response
    if (llmResponse.text) {
        return {
            answer: llmResponse.text,
        };
    }

    return {
        answer: "Desculpe, não consegui processar sua solicitação. Poderia tentar novamente?"
    };
  }
);
