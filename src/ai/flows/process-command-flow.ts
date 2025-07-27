
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
        system: `Você é um assistente pessoal para um casal, extremamente eficiente em interpretar comandos em linguagem natural e usar ferramentas para executar ações no aplicativo. Responda sempre em português do Brasil.

Sua tarefa é analisar o 'Comando do usuário' e decidir qual ferramenta chamar. Você DEVE chamar uma ferramenta se o comando corresponder a uma das ações possíveis.

**Contexto Disponível:**
- Data Atual: ${input.context?.currentDate} (use isso para resolver datas relativas como 'hoje' ou 'amanhã').

**Diretrizes das Ferramentas:**

1.  **addTransaction:**
    - Use para comandos que envolvam registrar gastos ou ganhos.
    - Ex: "adicione uma despesa de R$25 com lanche" -> \`addTransaction({ description: 'Lanche', amount: 25, type: 'expense', category: 'Alimentação', account: 'Conta Corrente' })\`
    - Seja proativo: infira a categoria a partir da descrição. Use 'Outros' se não tiver certeza.

2.  **createTask:**
    - Use para comandos que peçam para criar uma tarefa ou um item em uma lista de 'a fazer'.
    - Ex: "adicione uma tarefa para comprar leite" -> \`createTask({ text: 'Comprar leite' })\`
    - Ex: "lembrete para ligar para o médico" -> \`createTask({ text: 'Ligar para o médico' })\`

3.  **createCalendarEvent:**
    - Use para comandos que envolvam agendar um evento, compromisso ou reserva com data e/ou hora.
    - Ex: "agende um jantar para amanhã às 20h" -> \`createCalendarEvent({ title: 'Jantar', date: <data_de_amanha>, time: '20:00', category: 'Social' })\`
    - Título: Seja conciso (ex: "Jantar", "Reunião", "Cinema").
    - Data: Converta "hoje", "amanhã", "dia 25" para o formato 'YYYY-MM-DD'.
    - Categoria: Infira a categoria ('Social', 'Trabalho', 'Lazer', 'Pessoal'). Use 'Pessoal' como padrão.

**Processo de Resposta:**

- Após chamar uma ferramenta com sucesso, use a resposta dela para formular uma mensagem de confirmação clara e amigável.
- Se nenhuma ferramenta for chamada, ou se o comando for muito ambíguo, informe ao usuário que você não entendeu e dê exemplos claros do que você pode fazer.`,
        prompt: `Comando do usuário: "${input.command}"`,
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
