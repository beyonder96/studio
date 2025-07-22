
'use server';
/**
 * @fileOverview Location-based tools for Genkit AI flows.
 *
 * - getReviewsForPlace - A tool to fetch reviews for a given place using Google Places API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReviewSchema = z.object({
    author: z.string(),
    rating: z.number(),
    comment: z.string(),
});

export const getReviewsForPlace = ai.defineTool(
  {
    name: 'getReviewsForPlace',
    description: 'Returns real-world user reviews for a given location, such as a restaurant or hotel, using the Google Places API.',
    inputSchema: z.object({
      placeName: z.string().describe('The name of the place to get reviews for, e.g., "Restaurante Maní, São Paulo" or "Hotel Copacabana Palace".'),
    }),
    outputSchema: z.array(ReviewSchema),
  },
  async (input) => {
    console.log(`[getReviewsForPlace] Fetching reviews for: ${input.placeName} using Places API (New)`);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('Google Places API key is missing.');
      return [];
    }

    try {
      const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          // Request reviews, display name, and rating
          'X-Goog-FieldMask': 'places.reviews,places.displayName,places.rating', 
        },
        body: JSON.stringify({
          textQuery: input.placeName,
          languageCode: 'pt-BR',
        }),
      });

      const data = await response.json();

      if (!data.places || data.places.length === 0 || !data.places[0].reviews) {
        console.log(`[getReviewsForPlace] No places or reviews found for: ${input.placeName}`);
        return [];
      }
      
      const place = data.places[0];

      // Format and return the reviews from the new API response structure
      const reviews = place.reviews.map((review: any) => ({
        author: review.authorAttribution?.displayName || 'Anônimo',
        rating: review.rating,
        comment: review.text?.text || '',
      }));
      
      return reviews;

    } catch (error) {
      console.error(`[getReviewsForPlace] API call failed:`, error);
      return [];
    }
  }
);
