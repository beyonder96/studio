
'use server';
/**
 * @fileOverview Weather tool for Genkit AI flows.
 *
 * - getCurrentWeather - A tool to fetch the current weather for a location using the free Open-Meteo API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeatherSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    condition: z.string().describe('A brief description of the weather condition (e.g., "Clear sky", "Few clouds").'),
    icon: z.string().describe('The weather icon code based on WMO weather interpretation codes.'),
});

// Mapping from WMO code to our simplified condition and icon name
const wmoCodeMap: Record<number, { condition: string, icon: string }> = {
    0: { condition: 'Céu limpo', icon: '01d' },
    1: { condition: 'Principalmente limpo', icon: '01d' },
    2: { condition: 'Parcialmente nublado', icon: '02d' },
    3: { condition: 'Nublado', icon: '04d' },
    45: { condition: 'Nevoeiro', icon: '50d' },
    48: { condition: 'Nevoeiro com geada', icon: '50d' },
    51: { condition: 'Chuvisco leve', icon: '09d' },
    53: { condition: 'Chuvisco moderado', icon: '09d' },
    55: { condition: 'Chuvisco denso', icon: '09d' },
    56: { condition: 'Chuvisco gelado leve', icon: '09d' },
    57: { condition: 'Chuvisco gelado denso', icon: '09d' },
    61: { condition: 'Chuva fraca', icon: '10d' },
    63: { condition: 'Chuva moderada', icon: '10d' },
    65: { condition: 'Chuva forte', icon: '10d' },
    66: { condition: 'Chuva gelada leve', icon: '13d' },
    67: { condition: 'Chuva gelada forte', icon: '13d' },
    71: { condition: 'Neve fraca', icon: '13d' },
    73: { condition: 'Neve moderada', icon: '13d' },
    75: { condition: 'Neve forte', icon: '13d' },
    77: { condition: 'Grãos de neve', icon: '13d' },
    80: { condition: 'Pancadas de chuva fracas', icon: '09d' },
    81: { condition: 'Pancadas de chuva moderadas', icon: '09d' },
    82: { condition: 'Pancadas de chuva violentas', icon: '09d' },
    85: { condition: 'Pancadas de neve fracas', icon: '13d' },
    86: { condition: 'Pancadas de neve fortes', icon: '13d' },
    95: { condition: 'Trovoada', icon: '11d' },
    96: { condition: 'Trovoada com granizo fraco', icon: '11d' },
    99: { condition: 'Trovoada com granizo forte', icon: '11d' },
};


export const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Returns the current weather for a given city using the Open-Meteo API.',
    inputSchema: z.object({
      city: z.string().describe('The city name, e.g., "São Paulo, BR".'),
    }),
    outputSchema: WeatherSchema,
  },
  async (input) => {
    try {
      // Step 1: Geocode the city name to get latitude and longitude
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input.city)}&count=1&language=pt&format=json`;
      const geoResponse = await fetch(geocodingUrl);
      
      if(!geoResponse.ok) {
        throw new Error(`Geocoding API failed with status: ${geoResponse.status}`);
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Could not find location: ${input.city}`);
      }

      const { latitude, longitude } = geoData.results[0];

      // Step 2: Get the weather for the location
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
      const weatherResponse = await fetch(weatherUrl);

      if(!weatherResponse.ok) {
        throw new Error(`Weather API failed with status: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      const wmoCode = weatherData.current.weather_code;
      const interpretation = wmoCodeMap[wmoCode] || { condition: 'Clima desconhecido', icon: 'error' };

      return {
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: interpretation.condition,
        icon: interpretation.icon,
      };

    } catch (error) {
      console.error(`[getCurrentWeather] API call failed:`, error);
      return {
        temperature: 20,
        condition: 'Não foi possível obter o clima.',
        icon: 'error',
      };
    }
  }
);
