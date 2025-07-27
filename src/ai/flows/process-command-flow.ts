
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
  userId: z.string().describe('The unique ID of the user performing the action.'),
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
  const flowInput = {
    ...input,
    context: {
      ...input.context,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
    },
  };
  const output = await processCommandFlow(flowInput);
  return output!;
}

const processCommandFlow = ai.defineFlow(
  {
    name: 'processCommandFlow',
    inputSchema: ProcessCommandInputSchema,
    outputSchema: ProcessCommandOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        tools: [addTransaction, createTask, createCalendarEvent],
        system: `Você é um assistente pessoal para um casal, extremamente eficiente em interpretar comandos em linguagem natural e usar ferramentas para executar ações no aplicativo. Responda sempre em português do Brasil.

Sua tarefa é analisar o 'Comando do usuário' e decidir qual ferramenta chamar. Você DEVE chamar uma ferramenta se o comando corresponder a uma das ações possíveis.

**Contexto Disponível:**
- Data Atual: ${input.context?.currentDate} (use isso para resolver datas relativas como 'hoje' ou 'amanhã').
- ID do Usuário: ${input.userId} (você DEVE passar este ID para todas as ferramentas que o exigirem).

**Diretrizes das Ferramentas:**

1.  **addTransaction:**
    - Use para comandos que envolvam registrar gastos ou ganhos.
    - Ex: "adicione uma despesa de R$25 com lanche" -> \`addTransaction({ userId: "${input.userId}", description: 'Lanche', amount: 25, type: 'expense', category: 'Alimentação', account: 'Conta Corrente' })\`
    - Seja proativo: infira a categoria a partir da descrição. Use 'Outros' se não tiver certeza.

2.  **createTask:**
    - Use para comandos que peçam para criar uma tarefa ou um item em uma lista de 'a fazer'.
    - Ex: "adicione uma tarefa para comprar leite" -> \`createTask({ userId: "${input.userId}", text: 'Comprar leite' })\`
    - Ex: "lembrete para ligar para o médico" -> \`createTask({ userId: "${input.userId}", text: 'Ligar para o médico' })\`

3.  **createCalendarEvent:**
    - Use para comandos que envolvam agendar um evento, compromisso ou reserva com data e/ou hora.
    - Ex: "agende um jantar para amanhã às 20h" -> \`createCalendarEvent({ userId: "${input.userId}", title: 'Jantar', date: <data_de_amanha>, time: '20:00', category: 'Social' })\`
    - Título: Seja conciso (ex: "Jantar", "Reunião", "Cinema").
    - Data: Converta "hoje", "amanhã", "dia 25" para o formato 'YYYY-MM-DD'.
    - Categoria: Infira a categoria ('Social', 'Trabalho', 'Lazer', 'Pessoal'). Use 'Pessoal' como padrão.

**Processo de Resposta:**

- Se o comando do usuário for para usar uma ferramenta, chame-a. APÓS a ferramenta ser executada com sucesso, você DEVE retornar uma mensagem de confirmação amigável e curta. Por exemplo: "Tarefa criada!", "Evento agendado com sucesso!", "Transação adicionada.".
- Se o comando for ambíguo ou você não tiver uma ferramenta para ele, informe ao usuário que você não entendeu e dê exemplos do que você pode fazer.`,
        prompt: `Comando do usuário: "${input.command}"`,
    });

    const responseText = llmResponse.text;

    // If the response text is empty or very short, it likely failed or did nothing.
    // A successful tool call usually results in a confirmation message.
    if (!responseText || responseText.trim().length < 5) {
      return {
        success: false,
        message: "Desculpe, não consegui entender o comando. Tente algo como 'adicionar uma tarefa para comprar pão' ou 'agendar um jantar para sábado'."
      };
    }
    
    return {
      success: true,
      message: responseText,
    };
  }
);
