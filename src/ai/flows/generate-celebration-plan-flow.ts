
'use server';
/**
 * @fileOverview Flow to generate a celebration plan for an anniversary or birthday.
 *
 * - generateCelebrationPlan - A function that suggests gifts and activities.
 */
import { ai } from '@/ai/genkit';
import { GenerateCelebrationPlanInputSchema, GenerateCelebrationPlanOutputSchema, GenerateCelebrationPlanInput, GenerateCelebrationPlanOutput } from './schemas/generate-celebration-plan-schema';

export async function generateCelebrationPlan(input: GenerateCelebrationPlanInput): Promise<GenerateCelebrationPlanOutput> {
  return generateCelebrationPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCelebrationPlanPrompt',
  model: 'googleai/gemini-2.5-pro-latest',
  input: { schema: GenerateCelebrationPlanInputSchema },
  output: { schema: GenerateCelebrationPlanOutputSchema },
  prompt: `Você é um especialista em planejamento de comemorações românticas e criativas para casais.
Responda sempre em português do Brasil.

O objetivo é criar um plano de comemoração para a seguinte data especial:
- **Tipo de Data:** {{{dateType}}}
{{#if personName}}
- **Aniversariante:** {{{personName}}}
{{/if}}

Para te ajudar, aqui estão algumas informações sobre o casal:
- **Lista de Desejos:**
{{#each wishList}}
  - {{name}} (aprox. R$ {{price}})
{{else}}
  (A lista de desejos está vazia)
{{/each}}
- **Preferências:**
  - Comida Favorita: {{{couplePreferences.favoriteFood}}}
  - Lugar Favorito: {{{couplePreferences.favoritePlace}}}

**Sua Tarefa:**

1.  **Crie um Título Cativante:** Pense em um nome criativo para este plano de comemoração.
2.  **Escreva uma Descrição Curta:** Uma frase ou duas que resumam a vibe da comemoração.
3.  **Sugira Ideias de Presente:**
    - **Priorize a Lista de Desejos.** Se a lista de desejos tiver itens, sugira um ou dois deles como as principais opções de presente. Explique brevemente por que seria um bom presente.
    - Se a lista estiver vazia ou se quiser dar mais opções, sugira 1-2 outras ideias criativas que combinem com um casal.
4.  **Sugira Ideias de Comemoração:**
    - Crie 1-2 ideias de como comemorar a data. Pode ser um jantar, um passeio, uma atividade diferente, etc.
    - Use as preferências do casal (comida, lugar) como inspiração, mas sinta-se à vontade para ser criativo.
    - Para cada ideia, explique por que seria uma boa comemoração.

Formate a resposta final no JSON especificado. Use uma linguagem calorosa e romântica.
`,
});

const generateCelebrationPlanFlow = ai.defineFlow(
  {
    name: 'generateCelebrationPlanFlow',
    inputSchema: GenerateCelebrationPlanInputSchema,
    outputSchema: GenerateCelebrationPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
