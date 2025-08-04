
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
        model: 'googleai/gemini-1.5-flash-latest',
        tools: [addTransaction, createTask, createCalendarEvent, addItemToShoppingList, getTransactions],
        toolChoice: 'auto',
        prompt: `Você é um assistente pessoal para um casal. Sua tarefa principal é ajudá-los a gerenciar suas vidas, o que inclui responder a perguntas gerais e executar ações dentro do aplicativo através das ferramentas disponíveis.

          **Contexto Disponível:**
          - Data Atual: ${input.context?.currentDate} (use isso para resolver datas relativas como 'hoje' ou 'amanhã').

          **Processo de Resposta:**
          1.  **Analise o Comando:** Entenda o que o usuário está pedindo.
          2.  **Use uma Ferramenta (se aplicável):** Se o comando do usuário corresponder a uma das ações abaixo, chame a ferramenta apropriada com os parâmetros corretos.
              - **addTransaction:** Para registrar gastos ou ganhos.
              - **createTask:** Para criar uma tarefa ou um item em uma lista de 'a fazer'.
              - **createCalendarEvent:** Para agendar um evento, compromisso ou reserva com data e/ou hora.
              - **addItemToShoppingList:** Para adicionar itens a uma lista de compras.
              - **getTransactions:** Para responder a perguntas sobre gastos e transações. Use esta ferramenta para obter os dados necessários antes de formular a resposta.
          3.  **Gere uma Resposta de Confirmação:** APÓS a ferramenta ser executada com sucesso, você DEVE retornar uma mensagem de confirmação amigável e curta. Por exemplo: "Tarefa criada!", "Evento agendado com sucesso!", "Adicionado à sua lista de compras!". Se a ferramenta for de consulta (getTransactions), resuma os dados de forma clara para o usuário.
          4.  **Responda a Perguntas Gerais:** Se o comando não for uma ação para uma ferramenta, responda à pergunta do usuário da melhor forma possível, usando seu conhecimento geral.

          **Importante:** Você DEVE passar o \`userId: "${input.userId}"\` para todas as chamadas de ferramenta.

          Comando do usuário: "${input.command}"
        `,
    });

    const confirmationMessage = llmResponse.text;
    
    // Check if the model decided to call a tool
    if (llmResponse.toolRequest) {
      // The 'auto' toolChoice should handle execution, so we just need the confirmation.
       return {
            answer: confirmationMessage || "Ação executada com sucesso!",
        };
    }
    
    // If no tool was called, return the text response
    if (confirmationMessage) {
        return {
            answer: confirmationMessage,
        };
    }

    return {
        answer: "Desculpe, não consegui processar sua solicitação. Poderia tentar novamente?"
    };
  }
);
