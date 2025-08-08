
'use server';

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
        model: 'googleai/gemini-2.5-pro-latest', // Usando o modelo Pro para melhor raciocínio
        tools: [addTransaction, createTask, createCalendarEvent, addItemToShoppingList, getTransactions],
        toolChoice: 'auto',
        prompt: `Você é o "Copilot Vida a 2", um assistente ultra-eficiente para um casal. Sua função é interpretar comandos em linguagem natural e executar a ferramenta apropriada com os parâmetros corretos. Aja de forma rápida e direta.

          **Sua Missão Principal:** Analisar o comando do usuário, identificar a intenção principal (adicionar gasto, criar tarefa, adicionar item na compra, agendar evento), extrair todos os parâmetros, inferir o que for possível e chamar a ferramenta correta. Só faça perguntas se uma informação crítica estiver faltando.

          **FERRAMENTAS DISPONÍVEIS:**
          - \`addTransaction\`: Para registrar despesas ou receitas.
          - \`createTask\`: Para adicionar um item à lista de tarefas.
          - \`addItemToShoppingList\`: Para adicionar um ou mais itens à lista de compras.
          - \`createCalendarEvent\`: Para agendar um compromisso no calendário.
          - \`getTransactions\`: Para responder perguntas sobre gastos passados.

          **REGRAS DE INFERÊNCIA OBRIGATÓRIAS:**

          1.  **Intenção "Adicionar Transação" (addTransaction):**
              - **Gatilhos:** "gastei", "comprei", "paguei", "foi R$", "recebi", "ganhei", "entrou R$".
              - **Inferir Tipo:** "gastei"/"comprei" -> \`type: 'expense'\`. "recebi"/"ganhei" -> \`type: 'income'\`.
              - **Inferir Categoria:** "Uber", "gasolina" -> 'Transporte'. "Restaurante", "iFood", "mercado" -> 'Alimentação'. "Salário" -> 'Salário'.
              - **Parâmetros Críticos:** \`amount\`. Se faltar, pergunte: "Qual foi o valor?".

          2.  **Intenção "Adicionar Tarefa" (createTask):**
              - **Gatilhos:** "adicionar tarefa", "lembrete", "precisamos fazer", "anota aí".
              - **Extração:** Extraia todo o texto após o gatilho como o parâmetro \`text\`.
              - **Exemplo:** "adicionar tarefa levar os gatos no veterinário" -> \`createTask({ text: 'Levar os gatos no veterinário' })\`.

          3.  **Intenção "Adicionar Item de Compra" (addItemToShoppingList):**
              - **Gatilhos:** "adicionar na lista de compras", "coloca no mercado", "precisamos comprar".
              - **Extração:** Extraia todos os itens. A ferramenta aceita um array.
              - **Exemplo:** "adicionar na lista de compras leite, pão e 2 caixas de ovos" -> \`addItemToShoppingList({ items: ['leite', 'pão', '2 caixas de ovos'] })\`.

          4.  **Intenção "Agendar Evento" (createCalendarEvent):**
              - **Gatilhos:** "agendar", "marcar", "evento", "compromisso".
              - **Extração:** Extraia \`title\`, \`date\` e \`time\` do texto. Use a data de hoje (${input.context?.currentDate}) como referência para "hoje", "amanhã", etc.
              - **Parâmetros Críticos:** \`title\` e \`date\`. Se faltar, pergunte.
              - **Exemplo:** "marcar jantar com a Nicoli para sábado às 20h" -> \`createCalendarEvent({ title: 'Jantar com a Nicoli', date: '(data do próximo sábado)', time: '20:00' })\`.

          **Processo:**
          1.  Analise o comando.
          2.  Escolha UMA ferramenta.
          3.  Chame a ferramenta com os parâmetros corretos, usando o \`userId\` fornecido.
          4.  Se não for um comando para uma ferramenta, responda de forma conversacional.

          **Contexto Atual:**
          - Data de Hoje: ${input.context?.currentDate}
          
          **Comando do usuário:** "${input.command}"
        `,
    });

    const toolRequests = llmResponse.toolRequests;

    if (toolRequests.length > 0) {
        const toolRequest = toolRequests[0];
        // Adiciona o userId a todos os chamados de ferramenta
        const toolResult = await toolRequest.run({ ...toolRequest.input, userId: input.userId }); 
        
        let answer = "Feito!";

        // Se a ferramenta retornar uma mensagem específica, use-a.
        if (typeof toolResult === 'object' && toolResult && 'message' in toolResult) {
            answer = (toolResult as any).message;
        } else if(toolRequest.name === 'getTransactions') {
          const transactions = toolResult as any[];
          if(transactions.length === 0) {
            answer = "Não encontrei nenhuma transação com esses critérios."
          } else {
            const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const items = transactions.map(t => `- ${t.description}: R$ ${Math.abs(t.amount).toFixed(2)}`).join('\n');
            answer = `Encontrei ${transactions.length} transação(ões), totalizando R$ ${total.toFixed(2)}:\n${items}`;
          }
        }

        return { answer };
    }
    
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
