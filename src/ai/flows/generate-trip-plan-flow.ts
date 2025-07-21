
'use server';
/**
 * @fileOverview Flow to generate a trip plan suggestion.
 *
 * - generateTripPlan - A function that suggests a trip plan based on a prompt.
 * - GenerateTripPlanInput - The input type for the generateTripPlan function.
 * - GenerateTripPlanOutput - The return type for the generateTripPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTripPlanInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "a relaxing weekend at the beach" or "an adventure in the mountains".'),
  favoritePlace: z.string().optional().describe("The couple's favorite place, from their profile."),
});
export type GenerateTripPlanInput = z.infer<typeof GenerateTripPlanInputSchema>;

const GenerateTripPlanOutputSchema = z.object({
  plan: z.string().describe('The full trip plan, including destination, accommodation suggestions, activities, and a packing list. Should be formatted with markdown.'),
});
export type GenerateTripPlanOutput = z.infer<typeof GenerateTripPlanOutputSchema>;

export async function generateTripPlan(input: GenerateTripPlanInput): Promise<GenerateTripPlanOutput> {
  return generateTripPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTripPlanPrompt',
  input: {schema: GenerateTripPlanInputSchema},
  output: {schema: GenerateTripPlanOutputSchema},
  prompt: `Você é um agente de viagens especialista em roteiros românticos e criativos para casais.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie um plano de viagem inesquecível para duas pessoas.
O plano deve ser formatado em Markdown e conter as seguintes seções:
- ## Destino Sugerido 📍
- ## Sugestão de Acomodação 🏨
- ## Roteiro Sugerido 🗺️ (com pelo menos 3 atividades detalhadas)
- ## O que Levar na Mala 🎒

Use emojis para deixar o roteiro mais visual e convidativo. ✈️❤️

Solicitação do usuário: {{{prompt}}}

{{#if favoritePlace}}
Leve em consideração que o lugar favorito do casal é: {{{favoritePlace}}}. Use isso como inspiração extra se fizer sentido.
{{/if}}
`,
});

const generateTripPlanFlow = ai.defineFlow(
  {
    name: 'generateTripPlanFlow',
    inputSchema: GenerateTripPlanInputSchema,
    outputSchema: GenerateTripPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
