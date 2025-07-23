
'use server';
/**
 * @fileOverview Weather tool for Genkit AI flows.
 *
 * - getCurrentWeather - A tool to fetch the current weather for a location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const WeatherSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    condition: z.string().describe('A brief description of the weather condition (e.g., "Clear sky", "Few clouds").'),
    icon: z.string().describe('The weather icon code from the API.'),
});

export const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Returns the current weather for a given city.',
    inputSchema: z.object({
      city: z.string().describe('The city name, e.g., "São Paulo, BR".'),
    }),
    outputSchema: WeatherSchema,
  },
  async (input) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is missing.');
    }

    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: input.city,
          appid: apiKey,
          units: 'metric',
          lang: 'pt_br',
        },
      });

      const weatherData = response.data;
      
      return {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0]?.description || 'Não disponível',
        icon: weatherData.weather[0]?.icon || '01d',
      };
    } catch (error) {
      console.error(`[getCurrentWeather] API call failed:`, error);
      // Return a default or error state
      return {
        temperature: 20,
        condition: 'Não foi possível obter o clima.',
        icon: '01d',
      };
    }
  }
);
