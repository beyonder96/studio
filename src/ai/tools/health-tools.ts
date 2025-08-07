'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Função auxiliar para autenticação
function getGoogleAuthClient(accessToken: string): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

// Definimos a estrutura de dados que a ferramenta vai retornar
const HealthDataSchema = z.object({
  steps: z.number().optional().describe('Total de passos no período.'),
  calories: z.number().optional().describe('Total de calorias ativas gastas no período.'),
  sleepSeconds: z.number().optional().describe('Total de segundos dormidos no período.'),
});

export const getGoogleFitData = ai.defineTool(
  {
    name: 'getGoogleFitData',
    description: 'Busca dados de saúde e atividade (passos, calorias, sono) do Google Fit para um período específico.',
    inputSchema: z.object({
      accessToken: z.string().describe("Token de acesso OAuth2 do usuário."),
      startDate: z.string().describe("Data de início no formato YYYY-MM-DD"),
      endDate: z.string().describe("Data de fim no formato YYYY-MM-DD"),
    }),
    outputSchema: HealthDataSchema,
  },
  async ({ accessToken, startDate, endDate }) => {
    const authClient = getGoogleAuthClient(accessToken);
    const fitness = google.fitness({ version: 'v1', auth: authClient });

    // A API do Google Fit requer timestamps em nanosegundos
    const startTimeNs = new Date(startDate).getTime() * 1000000;
    const endTimeNs = new Date(endDate).getTime() * 1000000;

    try {
      const response = await fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            // Agregação para passos
            {
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
            },
            // Agregação para calorias
            {
              dataTypeName: 'com.google.calories.expended',
              dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
            },
            // Agregação para sono
            {
              dataTypeName: 'com.google.sleep.segment',
              dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
            }
          ],
          bucketByTime: { durationMillis: 86400000 }, // Agrupar por dia
          startTimeMillis: String(startTimeNs / 1000000),
          endTimeMillis: String(endTimeNs / 1000000),
        },
      });

      const buckets = response.data.bucket || [];
      let totalSteps = 0;
      let totalCalories = 0;
      let totalSleepSeconds = 0;

      for (const bucket of buckets) {
        for (const dataset of bucket.dataset || []) {
          for (const point of dataset.point || []) {
            if (point.dataTypeName?.includes('step_count')) {
              totalSteps += point.value?.[0].intVal || 0;
            }
            if (point.dataTypeName?.includes('calories.expended')) {
              totalCalories += point.value?.[0].fpVal || 0;
            }
            if (point.dataTypeName?.includes('sleep.segment')) {
              // O valor do sono é um código (1=acordado, 2=leve, etc.). A duração é a diferença de tempo.
              const start = Number(point.startTimeNanos);
              const end = Number(point.endTimeNanos);
              if (point.value?.[0].intVal && point.value[0].intVal > 1) { // Ignora tempo acordado
                 totalSleepSeconds += (end - start) / 1e9;
              }
            }
          }
        }
      }

      return {
        steps: totalSteps,
        calories: Math.round(totalCalories),
        sleepSeconds: Math.round(totalSleepSeconds),
      };

    } catch (error) {
      console.error("Falha ao buscar dados agregados do Google Fit:", error);
      return {};
    }
  }
);
