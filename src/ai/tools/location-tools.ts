
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
    console.log(`[getReviewsForPlace] Fetching reviews for: ${input.placeName}`);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('Google Places API key is missing.');
      return [];
    }

    try {
      // 1. Find the Place ID using Text Search
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(input.placeName)}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
        console.log(`[getReviewsForPlace] Place not found for: ${input.placeName}`);
        return [];
      }

      const placeId = searchData.results[0].place_id;

      // 2. Get Place Details, including reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}&language=pt-BR`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (detailsData.status !== 'OK' || !detailsData.result || !detailsData.result.reviews) {
        console.log(`[getReviewsForPlace] No reviews found for placeId: ${placeId}`);
        return [];
      }

      // 3. Format and return the reviews
      const reviews = detailsData.result.reviews.map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        comment: review.text,
      }));
      
      return reviews;

    } catch (error) {
      console.error(`[getReviewsForPlace] API call failed:`, error);
      return [];
    }
  }
);
