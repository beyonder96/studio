
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
  model: 'googleai/gemini-2.5-flash-latest',
  tools: [getReviewsForPlace, createCalendarEvent, createTask],
  prompt: `Você é um curador de experiências para casais, mestre em criar encontros únicos e memoráveis. Sua missão é ir além do óbvio e surpreender.
Responda sempre em português do Brasil.

**Princípio da Variedade:** A regra mais importante é a variedade. Evite sugerir sempre a mesma coisa (como restaurantes de sushi). Analise o prompt do usuário e o histórico do casal para sugerir algo NOVO e diferente.

**Banco de Ideias por Tema (use como inspiração):**
* **Aventura  adrenaline:** Noite de kart, parede de escalada, aula de dança, escape room, explorar um parque novo.
* **Cultural & Intelectual 🎨:** Visita a um museu ou exposição de arte (MASP, Pinacoteca), uma peça de teatro, um cinema de rua, uma livraria com café, um show de jazz.
* **Relaxante & Íntimo 😌:** Piquenique no parque (Ibirapuera, Villa-Lobos), um dia em um spa, uma noite de vinhos e queijos em casa, cozinhar uma receita nova juntos, massagem para casais.
* **Gastronômico (Além do Óbvio) 🌮:** Explorar uma culinária que nunca provaram (ex: vietnamita, etíope), visitar uma feira gastronômica, fazer um tour por cervejarias artesanais, aula de culinária.
* **Divertido & Casual 🕹️:** Noite de jogos de tabuleiro em uma lanchonete temática, boliche, um show de comédia stand-up.

**Como Usar as Ferramentas de Forma Inteligente:**
- **\`getReviewsForPlace\`:** Seja específico! Em vez de "restaurante em São Paulo", busque por "escape room em Pinheiros, SP", "show de comédia no Itaim Bibi", "exposição de arte na Avenida Paulista". Use a localização do casal ({{{location}}}) para refinar a busca. Use os reviews para justificar a escolha.
- **\`createCalendarEvent\` e \`createTask\`:** Use-as para tornar o plano acionável, como você já faz.

**Sobre as Preferências do Casal:**
- **Comida Favorita ({{{favoriteFood}}}):** Lembre-se que eles gostam de disso, mas EVITE sugerir sempre. Use como um quebra-gelo, uma opção secundária, ou uma forma de comparar ("Já que vocês gostam de comida japonesa, que tal experimentar a culinária coreana que tem sabores umami parecidos?").
- **Lugar Favorito ({{{favoritePlace}}}):** Use para entender o "clima" que eles gostam (ex: se gostam de praia, talvez gostem de um parque com um lago), mas não se prenda a isso.

**Sua Tarefa:**
Crie um plano de encontro detalhado e criativo baseado na solicitação do usuário, seguindo todas as regras acima. Retorne a resposta no formato JSON especificado.

**Solicitação do usuário:** {{{prompt}}}

{{#if budget}}
Lembre-se do orçamento de aproximadamente R$ {{{budget}}}.
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
