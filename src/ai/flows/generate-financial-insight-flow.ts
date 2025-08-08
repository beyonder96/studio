
'use server';
/**
 * @fileOverview Flow to generate a financial insight based on spending history.
 *
 * - generateFinancialInsight - A function that analyzes spending and suggests savings.
 */

import { ai } from '@/ai/genkit';
import { GenerateFinancialInsightInputSchema, GenerateFinancialInsightOutputSchema, GenerateFinancialInsightInput, GenerateFinancialInsightOutput } from './schemas/generate-financial-insight-schema';
import { recordSpendingFeedback } from '../tools/app-tools';


export async function generateFinancialInsight(input: GenerateFinancialInsightInput): Promise<GenerateFinancialInsightOutput> {
  return generateFinancialInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightPrompt',
  model: 'googleai/gemini-2.5-flash-latest',
  input: { schema: GenerateFinancialInsightInputSchema },
  output: { schema: GenerateFinancialInsightOutputSchema },
  tools: [recordSpendingFeedback],
  prompt: `Você é um consultor financeiro amigável e proativo para casais. Sua tarefa é analisar o histórico de gastos e fornecer um insight acionável para ajudá-los a economizar e alcançar suas metas.
Responda sempre em português do Brasil.

**Dados Recebidos:**

- **Histórico de Gastos (últimos 3 meses):**
{{#each financialHistory}}
  - **Mês: {{month}}**
    - Total Gasto: R$ {{total}}
    - Gastos por Categoria:
    {{#each categories}}
      - {{@key}}: R$ {{this}}
    {{/each}}
{{/each}}

- **Feedbacks de Gastos Anteriores:**
{{#each spendingFeedback}}
    - Categoria: {{category}}, Sentimento: {{sentiment}}{{#if reason}}, Razão: {{reason}}{{/if}}
{{else}}
    (Nenhum feedback de gastos registrado)
{{/each}}

- **Metas Atuais do Casal:**
{{#each goals}}
  - {{name}} (Progresso: {{progress}}%)
{{else}}
  (Nenhuma meta ativa no momento)
{{/each}}

**Sua Análise e Tarefa:**

1.  **Crie um Título Cativante:** Formule um título curto e amigável para o seu insight financeiro (ex: "Check-up Financeiro de [Mês]!").
2.  **Escreva o Insight Principal:**
    - Comece com uma saudação e um resumo geral do mês.
    - Identifique a **maior categoria de despesa** no último mês (exceto "Moradia" ou despesas fixas óbvias). Mencione o valor gasto.
    - Compare o gasto total do último mês com a média dos dois meses anteriores. Diga se eles gastaram mais ou menos no geral.
3.  **Encontre uma Oportunidade de Economia:**
    - Encontre uma categoria (diferente da maior despesa, se possível) onde eles gastaram **menos** no último mês em comparação com a média dos meses anteriores.
    - Calcule o valor economizado e parabenize-os por isso.
4.  **Crie uma Ação Sugerida:**
    - **Conecte a Economia a uma Meta:** Sugira que eles apliquem o valor economizado em uma de suas metas ativas. Formule uma ação clara (ex: "Contribuir R$ [valor] para a meta '[Nome da Meta]'").
    - **Sugira uma Mini-Meta:** Se não houver uma economia clara, sugira uma pequena meta de redução para a categoria de maior gasto do próximo mês (ex: "Tentar reduzir os gastos com 'Lazer' em 10% no próximo mês").
    - A ação deve ser prática e motivadora.
5.  **Peça Feedback (Opcional):** Se você identificar uma categoria de alto gasto que também teve feedback negativo no passado (usando a ferramenta 'recordSpendingFeedback'), mencione isso e pergunte se eles querem criar um plano para reduzir esses gastos.

**Formato da Resposta:**
- **title:** O título cativante.
- **insight:** Um parágrafo bem escrito combinando os pontos 2 e 3 da análise.
- **suggestedAction:** O objeto com o texto da ação, a meta relacionada e o valor, se aplicável.

Use uma linguagem positiva e encorajadora. O objetivo é capacitar o casal, não criticá-los.
`,
});

const generateFinancialInsightFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightFlow',
    inputSchema: GenerateFinancialInsightInputSchema,
    outputSchema: GenerateFinancialInsightOutputSchema,
  },
  async (input) => {
    // Basic validation to ensure we have enough data
    if (input.financialHistory.length < 2) {
      return {
        title: "Mais dados necessários",
        insight: "Continue registrando suas transações por pelo menos dois meses para receber insights financeiros personalizados e completos.",
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
