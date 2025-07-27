
'use server';
/**
 * @fileOverview A general-purpose command processing flow for the AI assistant.
 *
 * - processCommand - A function that interprets a user's text command and executes the appropriate tool.
 * - ProcessCommandInput - The input type for the processCommand function.
 * - ProcessCommandOutput - The return type for the processCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addTransaction, createCalendarEvent, createTask } from '../tools/app-tools';
import { format } from 'date-fns';

const ProcessCommandInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
  context: z.object({
    currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
  }).optional(),
});
export type ProcessCommandInput = z.infer<typeof ProcessCommandInputSchema>;

const ProcessCommandOutputSchema = z.object({
  success: z.boolean().describe('Whether the command was successfully executed.'),
  message: z.string().describe('A confirmation message to be shown to the user.'),
});
export type ProcessCommandOutput = z.infer<typeof ProcessCommandOutputSchema>;

export async function processCommand(input: ProcessCommandInput): Promise<ProcessCommandOutput> {
  // Pass the input directly, merged with the context.
  const flowInput = {
    ...input,
    context: {
      ...input.context,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
    },
  };
  // The .run() method does not return the output directly.
  // Instead, we should call the flow function itself.
  const output = await processCommandFlow(flowInput);
  return output!;
}

const processCommandFlow = ai.defineFlow(
  {
    name: 'processCommandFlow',
    inputSchema: ProcessCommandInputSchema,
    outputSchema: ProcessCommandOutputSchema,
    tools: [addTransaction, createTask, createCalendarEvent],
  },
  async (input) => {
    const response = await ai.generate({
        prompt: `Você é um assistente pessoal para um casal. Sua tarefa é interpretar o comando do usuário e usar as ferramentas disponíveis para executá-lo.

        Comando do usuário: "${input.command}"

        Use o contexto fornecido para ajudar a preencher os parâmetros das ferramentas, se necessário. Por exemplo, se o usuário não especificar uma data, use a data atual: ${input.context?.currentDate}.

        Seja proativo. Por exemplo, para um comando como "adicione uma despesa de 50 reais com café", você deve inferir que a categoria é "Alimentação" e o tipo é "expense".
        Se o comando for ambíguo, peça esclarecimentos (embora para esta versão, priorize a execução com base na melhor inferência).

        Após chamar uma ferramenta, use a resposta dela para formular uma mensagem de confirmação clara e amigável para o usuário.
        Se nenhuma ferramenta for chamada, informe ao usuário que você não entendeu o comando.
        Responda sempre em português do Brasil.`,
        history: [], // For this simple command flow, we don't need conversation history
    });
    
    const history = response.history || [];
    const output = response.output;

    const toolCalls = history.filter(h => h.role === 'model' && h.content.some(c => !!c.toolRequest));
    
    if (toolCalls.length === 0) {
      return {
        success: false,
        message: "Desculpe, não consegui entender o seu comando. Tente algo como 'adicione uma tarefa para comprar leite' ou 'adicione uma despesa de R$25 com lanche'."
      };
    }
    
    // For simplicity, we assume the last tool call is the most relevant one for the confirmation message.
    const lastToolResponse = history.find(h => h.role === 'tool');

    if (lastToolResponse && lastToolResponse.content[0].toolResponse?.output?.success) {
       const toolName = lastToolResponse.content[0].toolResponse.name;
       let confirmationMessage = "Ação concluída com sucesso!";

       switch (toolName) {
           case 'addTransaction':
               confirmationMessage = "Transação adicionada com sucesso!";
               break;
           case 'createTask':
                confirmationMessage = "Tarefa adicionada à sua lista!";
                break;
           case 'createCalendarEvent':
                confirmationMessage = "Evento adicionado ao seu calendário!";
                break;
       }

      return { success: true, message: confirmationMessage };
    }
    
    // Use the LLM's final text output if available and no tool succeeded
    if (output) {
      return { success: true, message: output.text! };
    }

    return { success: false, message: "Ocorreu um erro ao processar seu comando." };
  }
);
