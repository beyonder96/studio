
'use server';
/**
 * @fileOverview Flow to generate a financial insight based on spending history.
 *
 * - generateFinancialInsight - A function that analyzes spending and suggests savings.
 */

import { ai } from '@/ai/genkit';
import { GenerateFinancialInsightInputSchema, GenerateFinancialInsightOutputSchema, GenerateFinancialInsightInput, GenerateFinancialInsightOutput } from './schemas/generate-financial-insight-schema';


export async function generateFinancialInsight(input: GenerateFinancialInsightInput): Promise<GenerateFinancialInsightOutput> {
  return generateFinancialInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightPrompt',
  input: { schema: GenerateFinancialInsightInputSchema },
  output: { schema: GenerateFinancialInsightOutputSchema },
  prompt: `Você é um consultor financeiro amigável e proativo para casais. Sua tarefa é analisar o histórico de gastos dos últimos 3 meses e fornecer um insight acionável para ajudá-los a economizar e alcançar suas metas.
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

- **Metas Atuais do Casal:**
{{#each goals}}
  - {{this}}
{{else}}
  (Nenhuma meta ativa no momento)
{{/each}}

**Sua Análise:**

1.  **Identifique uma Oportunidade:** Compare os gastos do último mês com a média dos dois meses anteriores. Encontre uma categoria (exceto "Moradia" ou outras despesas fixas óbvias) onde eles gastaram *menos* no último mês. Isso representa uma economia!
2.  **Calcule a Economia:** Calcule a diferença entre a média dos dois primeiros meses e o gasto do último mês para essa categoria.
3.  **Crie o Insight:**
    - Formule um título chamativo para a sua descoberta (ex: "Economia Inteligente em Lazer!").
    - Escreva um insight parabenizando o casal pela economia na categoria que você identificou.
    - **Conecte com uma Meta:** Se houver metas ativas, sugira que eles apliquem o valor economizado em uma de suas metas. Mencione a meta específica.
    - Se não houver metas, sugira que eles guardem o dinheiro ou comecem uma nova meta.

**Exemplo de Resposta:**
- Título: "Ótima Economia em Alimentação!"
- Insight: "Percebi que em {{last_month}}, vocês gastaram R$ {{amount_saved}} a menos com Alimentação em comparação com a média dos meses anteriores. Que tal usar essa economia para dar um gás na meta '{{goal_name}}'?"
- Ação Sugerida: "Contribuir R$ {{amount_saved}} para a meta {{goal_name}}"

Se não encontrar uma economia clara, forneça uma dica geral baseada na categoria de maior gasto.
Formate a resposta final no JSON especificado.
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
    if (input.financialHistory.length < 3) {
      return {
        title: "Mais dados necessários",
        insight: "Continue registrando suas transações para receber insights financeiros personalizados.",
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
