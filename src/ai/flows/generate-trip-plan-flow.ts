
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
import { getReviewsForPlace } from '../tools/location-tools';

const GenerateTripPlanInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "a relaxing weekend at the beach" or "an adventure in the mountains".'),
  favoritePlace: z.string().optional().describe("The couple's favorite place, from their profile."),
  location: z.string().optional().describe("The couple's current location (city/state), from their profile."),
  budget: z.number().optional().describe("The estimated budget for the trip."),
});
export type GenerateTripPlanInput = z.infer<typeof GenerateTripPlanInputSchema>;

const ReviewSchema = z.object({
    author: z.string().describe('The name of the person who wrote the review.'),
    rating: z.number().describe('A rating from 1 to 5.'),
    comment: z.string().describe('The content of the review.'),
});

const ActivitySchema = z.object({
    name: z.string().describe('The name of the activity or place.'),
    description: z.string().describe('A brief description of the activity.'),
    reviews: z.array(ReviewSchema).optional().describe('A list of reviews for this activity or place.'),
});

const GenerateTripPlanOutputSchema = z.object({
    destination: z.string().describe('The suggested destination city/region.'),
    accommodation: z.object({
        name: z.string().describe('The name of the suggested hotel or lodging.'),
        description: z.string().describe('A brief description of the accommodation.'),
        reviews: z.array(ReviewSchema).optional().describe('A list of reviews for the accommodation.'),
    }),
    activities: z.array(ActivitySchema).describe('An array of at least 3 suggested activities.'),
    packingList: z.array(z.string()).describe('A list of items to pack for the trip.'),
    planMarkdown: z.string().describe('The full trip plan, formatted in Markdown. This should be a user-friendly combination of all the fields above.'),
});
export type GenerateTripPlanOutput = z.infer<typeof GenerateTripPlanOutputSchema>;

export async function generateTripPlan(input: GenerateTripPlanInput): Promise<GenerateTripPlanOutput> {
  return generateTripPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTripPlanPrompt',
  input: {schema: GenerateTripPlanInputSchema},
  output: {schema: GenerateTripPlanOutputSchema},
  tools: [getReviewsForPlace],
  prompt: `Você é um agente de viagens especialista em roteiros românticos e criativos para casais.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie um plano de viagem inesquecível para duas pessoas.

Para cada sugestão de acomodação ou atividade, busque por avaliações usando a ferramenta 'getReviewsForPlace' para dar mais credibilidade.
IMPORTANTE: Ao chamar a ferramenta, no parâmetro 'placeName', sempre inclua a cidade/região do destino para garantir a precisão. Por exemplo: "Hotel Copacabana Palace, Rio de Janeiro".

O plano deve ser retornado no formato JSON especificado.
Além disso, crie um resumo amigável e bem formatado em Markdown no campo 'planMarkdown', contendo as seguintes seções:
- ## Destino Sugerido 📍
- ## Sugestão de Acomodação 🏨 (com avaliações)
- ## Roteiro Sugerido 🗺️ (com pelo menos 3 atividades detalhadas e suas avaliações)
- ## O que Levar na Mala 🎒

Use emojis para deixar o roteiro mais visual e convidativo. ✈️❤️

Solicitação do usuário: {{{prompt}}}

{{#if location}}
O casal está partindo de: {{{location}}}. Leve isso em consideração para a logística da viagem.
{{/if}}

{{#if budget}}
O orçamento para a viagem é de aproximadamente R$ {{{budget}}}. Tente se manter dentro deste valor.
{{/if}}

{{#if favoritePlace}}
Leve em consideração que o lugar favorito do casal é: {{{favoritePlace}}}. Use isso como INSPIRAÇÃO, mas sinta-se à vontade para sugerir outros tipos de lugares e experiências.
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
