
'use server';
/**
 * @fileOverview Flow to generate a creative date idea suggestion for a couple.
 *
 * - generateDateIdea - A function that suggests a date idea based on a prompt.
 * - GenerateDateIdeaInput - The input type for the generateDateIdea function.
 * - GenerateDateIdeaOutput - The return type for the generateDateIdea function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDateIdeaInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "a fun and cheap night out" or "a relaxing evening at home".'),
  favoriteFood: z.string().optional().describe("The couple's favorite food, from their profile."),
  favoritePlace: z.string().optional().describe("The couple's favorite place, from their profile."),
  location: z.string().optional().describe("The couple's current location (city/state), from their profile."),
});
export type GenerateDateIdeaInput = z.infer<typeof GenerateDateIdeaInputSchema>;

const GenerateDateIdeaOutputSchema = z.object({
    title: z.string().describe('The catchy title for the date idea.'),
    category: z.string().describe('The category of the date, e.g., "Romântico", "Aventura", "Cultural", "Em Casa", "Gastronômico".'),
    detailsMarkdown: z.string().describe('The full date idea, formatted in Markdown. This should be a user-friendly plan with a description and a step-by-step itinerary.'),
});
export type GenerateDateIdeaOutput = z.infer<typeof GenerateDateIdeaOutputSchema>;

export async function generateDateIdea(input: GenerateDateIdeaInput): Promise<GenerateDateIdeaOutput> {
  return generateDateIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDateIdeaPrompt',
  input: { schema: GenerateDateIdeaInputSchema },
  output: { schema: GenerateDateIdeaOutputSchema },
  prompt: `Você é um especialista em criar ideias de encontros românticos e criativos para casais.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie uma ideia de encontro memorável para duas pessoas.

O plano deve ser retornado no formato JSON especificado.
No campo 'detailsMarkdown', crie um roteiro amigável e bem formatado em Markdown, contendo:
- ## 💖 Descrição
- ## 🗺️ O Roteiro
- ## ✨ Dica Extra

Use emojis para deixar a sugestão mais visual e convidativa. 🥂

Solicitação do usuário: {{{prompt}}}

{{#if location}}
O casal está em: {{{location}}}. Considere isso para sugestões de locais.
{{/if}}

{{#if favoriteFood}}
A comida favorita deles é: {{{favoriteFood}}}. Use isso para inspirar ideias gastronômicas.
{{/if}}

{{#if favoritePlace}}
O lugar favorito deles é: {{{favoritePlace}}}. Tente incorporar esse tipo de ambiente na sua sugestão.
{{/if}}
`,
});

const generateDateIdeaFlow = ai.defineFlow(
  {
    name: 'generateDateIdeaFlow',
    inputSchema: GenerateDateIdeaInputSchema,
    outputSchema: GenerateDateIdeaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
