
'use server';
/**
 * @fileOverview Location-based tools for Genkit AI flows.
 *
 * - getReviewsForPlace - A tool to fetch reviews for a given place.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getReviewsForPlace = ai.defineTool(
  {
    name: 'getReviewsForPlace',
    description: 'Returns reviews for a given location, such as a restaurant or hotel.',
    inputSchema: z.object({
      placeName: z.string().describe('The name of the place to get reviews for.'),
    }),
    outputSchema: z.array(z.object({
        author: z.string(),
        rating: z.number(),
        comment: z.string(),
    })),
  },
  async (input) => {
    console.log(`[getReviewsForPlace] Fetching reviews for: ${input.placeName}`);
    // In a real application, this would call an external API like Google Places.
    // For this prototype, we'll return realistic mock data.
    const mockReviews = [
        { author: 'Ana Silva', rating: 5, comment: 'Experiência incrível! O lugar é lindo e o atendimento foi impecável. Recomendo muito!' },
        { author: 'Bruno Costa', rating: 4, comment: 'Gostei bastante, a comida era ótima, mas o serviço um pouco lento. Mesmo assim, vale a pena.' },
        { author: 'Carla Dias', rating: 5, comment: 'Simplesmente perfeito! Cada detalhe foi pensado para nos sentirmos especiais. Voltaremos com certeza.' },
    ];
    
    // Simulate some variability
    if (input.placeName.toLowerCase().includes('hotel')) {
        return mockReviews.slice(0, 2);
    }
    if (input.placeName.toLowerCase().includes('restaurante')) {
         return [
            { author: 'Marcos Andrade', rating: 5, comment: 'A melhor comida da cidade! Sabor autêntico e ambiente muito agradável.' },
            { author: 'Juliana Pereira', rating: 4, comment: 'Pratos deliciosos, mas achei um pouco caro pelo que oferece. O ambiente compensa.' },
         ]
    }

    return mockReviews;
  }
);
