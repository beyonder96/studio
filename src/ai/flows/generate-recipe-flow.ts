
'use server';
/**
 * @fileOverview Flow to generate a recipe suggestion, optionally using pantry items.
 *
 * - generateRecipeSuggestion - A function that suggests a recipe based on a prompt.
 * - GenerateRecipeInput - The input type for the generateRecipeSuggestion function.
 * - GenerateRecipeOutput - The return type for the generateRecipeSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PantryItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
});

const GenerateRecipeInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "something quick with chicken" or "a romantic dinner".'),
  usePantry: z.boolean().describe('Whether to use the user\'s pantry items as a primary source for ingredients.'),
  pantryItems: z.array(PantryItemSchema).optional().describe('An array of items currently in the user\'s pantry.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipe: z.string().describe('The full recipe, including title, ingredients, and instructions. Should be formatted with markdown.'),
  missingItems: z.array(z.string()).optional().describe('A list of ingredients required for the recipe that are not in the user\'s pantry.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipeSuggestion(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  model: 'googleai/gemini-2.5-pro-latest',
  input: { schema: GenerateRecipeInputSchema },
  output: { schema: GenerateRecipeOutputSchema },
  prompt: `Você é um chef criativo que ajuda casais a decidir o que cozinhar.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie uma receita simples e deliciosa para duas pessoas.
Inclua um título cativante, uma lista de ingredientes e instruções claras, passo a passo.
Formate toda a resposta em Markdown, usando títulos (##), negrito (**) e listas.
Seja amigável e use alguns emojis para deixar a receita mais divertida e convidativa. 🧑‍🍳🍽️

Solicitação do usuário: {{{prompt}}}

{{#if usePantry}}
O usuário quer usar os ingredientes que já possui. Aqui está a lista de itens na despensa deles:
{{#each pantryItems}}
- {{name}} ({{quantity}})
{{/each}}

Baseie a receita o máximo possível nesses itens.
Depois de criar a receita, compare a lista de ingredientes da receita com a lista da despensa.
Se algum ingrediente da receita não estiver na despensa, liste-os no campo 'missingItems'. Se todos os ingredientes estiverem na despensa, deixe 'missingItems' como um array vazio.
{{/if}}
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
