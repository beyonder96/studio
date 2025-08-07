
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
        model: 'googleai/gemini-1.5-pro-latest',
        tools: [addTransaction, createTask, createCalendarEvent, addItemToShoppingList, getTransactions],
        toolChoice: 'auto',
        prompt: `Você é o "Copilot Vida a 2", um assistente financeiro ultra-eficiente para um casal. Seu objetivo é tornar o registro de transações o mais rápido e natural possível, exigindo o mínimo de esforço do usuário.

          **Sua Missão Principal:** Analisar o comando do usuário, extrair todas as informações, inferir o que for possível, e chamar a ferramenta 'addTransaction'. Só faça perguntas se uma informação crítica (como o valor) estiver faltando.

          **Regras de Inferência Obrigatórias:**

          1.  **Inferir o TIPO da Transação:**
              - Se o usuário disser "gastei", "comprei", "paguei", "foi X reais em...", o tipo é SEMPRE 'expense'.
              - Se o usuário disser "recebi", "ganhei", "entrou X", o tipo é SEMPRE 'income'.

          2.  **Inferir a CATEGORIA da Transação (muito importante):**
              - **Transporte:** para palavras como "Uber", "99", "gasolina", "combustível", "metrô", "pedágio".
              - **Alimentação:** para "restaurante", "iFood", "mercado", "lanche", "Outback", "Sukiya", "pizza".
              - **Moradia:** para "aluguel", "condomínio", "luz", "água", "internet".
              - **Lazer:** para "cinema", "show", "bar", "parque".
              - **Saúde:** para "farmácia", "remédio", "médico", "consulta".
              - **Salário:** para "salário", "pagamento da empresa".
              - Se não tiver certeza, use a categoria "Outros".

          3.  **Inferir a DATA:**
              - Se a data não for mencionada, use SEMPRE a data atual: ${input.context?.currentDate}.

          4.  **Lidar com Informações Faltantes:**
              - Se o VALOR da transação não for informado, você DEVE perguntar ao usuário antes de fazer qualquer outra coisa. Ex: "Claro, qual foi o valor gasto na Uber?".
              - Se a CONTA/CARTÃO não for informada, você pode perguntar, mas se o comando for simples, pode assumir a conta principal se souber qual é, ou pedir ao usuário.

          **Exemplo de Execução Perfeita:**
          - **Comando do Usuário:** "gastei 12 reais na Uber no banco X"
          - **Seu Raciocínio (interno):**
              1. "gastei" -> \`type: 'expense'\`.
              2. "12 reais" -> \`amount: 12\`.
              3. "Uber" -> \`description: 'Uber'\`, \`category: 'Transporte'\`.
              4. "no banco X" -> \`account: 'banco X'\`.
              5. Data não mencionada -> \`date: (data de hoje)\`.
          - **Sua Ação:** Chamar a ferramenta \`addTransaction\` com todos esses dados, sem fazer nenhuma pergunta.

          **Comando do usuário:** "${input.command}"
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
