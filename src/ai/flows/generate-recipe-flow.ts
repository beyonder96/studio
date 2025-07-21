
'use server';
/**
 * @fileOverview Flow to generate a recipe suggestion.
 *
 * - generateRecipeSuggestion - A function that suggests a recipe based on a prompt.
 * - GenerateRecipeInput - The input type for the generateRecipeSuggestion function.
 * - GenerateRecipeOutput - The return type for the generateRecipeSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRecipeInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "something quick with chicken" or "a romantic dinner".'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipe: z.string().describe('The full recipe, including title, ingredients, and instructions. Should be formatted with markdown.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipeSuggestion(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: { schema: GenerateRecipeInputSchema },
  output: { schema: GenerateRecipeOutputSchema },
  prompt: `Você é um chef criativo que ajuda casais a decidir o que cozinhar.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie uma receita simples e deliciosa para duas pessoas.
Inclua um título cativante, uma lista de ingredientes e instruções claras, passo a passo.
Formate toda a resposta em Markdown, usando títulos (##), negrito (**) e listas.
Seja amigável e use alguns emojis para deixar a receita mais divertida e convidativa. 🧑‍🍳🍽️

Solicitação do usuário: {{{prompt}}}
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
