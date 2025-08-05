
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

const DailyItinerarySchema = z.object({
    day: z.number().describe('The day number, e.g., 1, 2, 3.'),
    title: z.string().describe('A catchy title for the day, e.g., "Dia de Exploração Histórica".'),
    activities: z.array(ActivitySchema).describe('An array of activities planned for this day.'),
});

const GenerateTripPlanOutputSchema = z.object({
    destination: z.string().describe('The suggested destination city/region.'),
    accommodation: z.object({
        name: z.string().describe('The name of the suggested hotel or lodging.'),
        description: z.string().describe('A brief description of the accommodation.'),
        reviews: z.array(ReviewSchema).optional().describe('A list of reviews for the accommodation.'),
    }),
    itinerary: z.array(DailyItinerarySchema).describe('A day-by-day itinerary for the trip.'),
    checklist: z.array(z.string()).describe('A comprehensive checklist for the trip, including packing items and preparation tasks like buying currency.'),
});
export type GenerateTripPlanOutput = z.infer<typeof GenerateTripPlanOutputSchema>;

export async function generateTripPlan(input: GenerateTripPlanInput): Promise<GenerateTripPlanOutput> {
  return generateTripPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTripPlanPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateTripPlanInputSchema},
  output: {schema: GenerateTripPlanOutputSchema},
  tools: [getReviewsForPlace],
  prompt: `Você é um agente de viagens especialista em roteiros românticos e criativos para casais.
Responda sempre em português do Brasil.
Baseado na solicitação do usuário, crie um plano de viagem inesquecível para duas pessoas.

IMPORTANTE: Para encontrar acomodações e atividades, use a ferramenta 'getReviewsForPlace'. Em vez de inventar um nome de lugar, descreva o que você procura no parâmetro 'placeName'.
Priorize a localização mencionada na solicitação do usuário. Se não houver, use a localização do perfil.
Por exemplo, se o usuário pedir "uma viagem para Gramado", chame a ferramenta assim: getReviewsForPlace(placeName: "hotel em Gramado").
Use a ferramenta para DESCOBRIR lugares reais. NÃO invente nomes de lugares.
Apenas os lugares retornados pela ferramenta devem ser incluídos na resposta final.

O plano deve ser retornado no formato JSON especificado.
Crie um roteiro diário (itinerary) com pelo menos 3 dias, detalhando as atividades de cada dia.
Crie também um checklist de viagem abrangente, incluindo itens para mala e tarefas de preparação (ex: comprar moeda, verificar passaportes).

Use emojis para deixar o roteiro mais visual e convidativo. ✈️❤️

Solicitação do usuário: {{{prompt}}}

{{#if location}}
A localização base do casal é: {{{location}}}. Leve isso em consideração para a logística da viagem se um destino específico não for solicitado.
{{/if}}

{{#if budget}}
O orçamento para a viagem é de aproximadamente R$ {{{budget}}}. Tente se manter dentro deste valor.
{{/if}}

{{#if favoritePlace}}
INSPIRAÇÃO: O lugar favorito do casal é: {{{favoritePlace}}}. Use isso como INSPIRAÇÃO, mas sinta-se à vontade para sugerir outros tipos de lugares e experiências.
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
