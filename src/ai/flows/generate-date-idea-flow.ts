
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
import { getReviewsForPlace } from '../tools/location-tools';
import { createCalendarEvent, createTask } from '../tools/app-tools';

const GenerateDateIdeaInputSchema = z.object({
  prompt: z.string().describe('The user prompt, e.g., "a fun and cheap night out" or "a relaxing evening at home".'),
  favoriteFood: z.string().optional().describe("The couple's favorite food, from their profile."),
  favoritePlace: z.string().optional().describe("The couple's favorite place, from their profile."),
  location: z.string().optional().describe("The couple's current location (city/state), from their profile."),
  budget: z.number().optional().describe("The estimated budget for the date."),
});
export type GenerateDateIdeaInput = z.infer<typeof GenerateDateIdeaInputSchema>;

const ReviewSchema = z.object({
    author: z.string().describe('The name of the person who wrote the review.'),
    rating: z.number().describe('A rating from 1 to 5.'),
    comment: z.string().describe('The content of the review.'),
});

const VenueSchema = z.object({
    name: z.string().describe('The name of the suggested venue (e.g., restaurant, park, cinema).'),
    description: z.string().describe('A brief description of why this venue is a good fit for the date.'),
    reviews: z.array(ReviewSchema).optional().describe('A list of reviews for this venue.'),
});

const GenerateDateIdeaOutputSchema = z.object({
    title: z.string().describe('The catchy title for the date idea.'),
    category: z.string().describe('The category of the date, e.g., "Romântico", "Aventura", "Cultural", "Em Casa", "Gastronômico".'),
    detailsMarkdown: z.string().describe('The full date idea, formatted in Markdown. This should be a user-friendly plan with a description and a step-by-step itinerary. If the date involves food, suggest multiple recipes here.'),
    suggestedVenues: z.array(VenueSchema).optional().describe('A list of specific, real-world venues suggested for the date. Only include venues returned by the getReviewsForPlace tool. Suggest multiple venues if possible.'),
});
export type GenerateDateIdeaOutput = z.infer<typeof GenerateDateIdeaOutputSchema>;

export async function generateDateIdea(input: GenerateDateIdeaInput): Promise<GenerateDateIdeaOutput> {
  return generateDateIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDateIdeaPrompt',
  input: { schema: GenerateDateIdeaInputSchema },
  output: { schema: GenerateDateIdeaOutputSchema },
  tools: [getReviewsForPlace, createCalendarEvent, createTask],
  prompt: `Você é um especialista em criar e organizar ideias de encontros românticos e criativos para casais.
Responda sempre em português do Brasil.
Sua tarefa é multifacetada:
1.  **Criar a Ideia:** Baseado na solicitação do usuário, crie uma ideia de encontro memorável para duas pessoas.
2.  **Encontrar Locais (se aplicável):** Use a ferramenta 'getReviewsForPlace' para encontrar locais reais. NÃO invente nomes de lugares. Apenas os lugares retornados pela ferramenta devem ser incluídos na resposta final.
3.  **Agir como um Assistente:** Se a solicitação do usuário mencionar uma data ou dia específico (ex: "para sábado", "para o dia 25"), use a ferramenta 'createCalendarEvent' para criar um evento no calendário do casal. Se o encontro exigir uma ação (ex: "fazer uma reserva"), use a ferramenta 'createTask' para adicionar uma tarefa à lista do casal.

**Regras para Ferramentas:**
- **'getReviewsForPlace':** Chame a ferramenta com uma descrição do que você procura. Ex: getReviewsForPlace(placeName: "restaurante italiano em Tatuapé, São Paulo").
- **'createCalendarEvent':** Use esta ferramenta para agendar o encontro se uma data for mencionada. Extraia a data e hora do prompt do usuário.
- **'createTask':** Crie tarefas para ações que o casal precisa tomar. Ex: createTask(text: "Reservar o Restaurante X para sábado").

O plano deve ser retornado no formato JSON especificado.
No campo 'detailsMarkdown', crie um roteiro amigável e bem formatado em Markdown, contendo:
- ## 💖 Descrição
- ## 🗺️ O Roteiro (ou Opções de Receita)
- ## ✨ Dica Extra

Use emojis para deixar a sugestão mais visual e convidativa. 🥂

Solicitação do usuário: {{{prompt}}}

{{#if budget}}
O orçamento para o encontro é de aproximadamente R$ {{{budget}}}. Tente se manter dentro deste valor.
{{/if}}

{{#if location}}
A localização base do casal é: {{{location}}}. Use essa informação para encontrar locais caso nenhuma localização seja especificada na solicitação.
{{/if}}

{{#if favoriteFood}}
INSPIRAÇÃO: A comida favorita deles é: {{{favoriteFood}}}. Use isso como INSPIRAÇÃO, mas sinta-se à vontade para sugerir outras coisas também.
{{/if}}

{{#if favoritePlace}}
INSPIRAÇÃO: O lugar favorito deles é: {{{favoritePlace}}}. Use isso como INSPIRAÇÃO para o tipo de ambiente, mas explore novas possibilidades.
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

    