
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
  weight: z.number().optional().describe('Peso mais recente em kg no período.'),
});

export const getGoogleFitData = ai.defineTool(
  {
    name: 'getGoogleFitData',
    description: 'Busca dados de saúde e atividade (passos, calorias, sono, peso) do Google Fit para um período específico.',
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
            },
             // Agregação para peso
            {
              dataTypeName: 'com.google.weight',
              dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight'
            }
          ],
          bucketByTime: { durationMillis: endTimeNs - startTimeNs }, // Um único bucket para todo o período
          startTimeMillis: String(startTimeNs / 1000000),
          endTimeMillis: String(endTimeNs / 1000000),
        },
      });

      const buckets = response.data.bucket || [];
      let totalSteps = 0;
      let totalCalories = 0;
      let totalSleepSeconds = 0;
      let latestWeight: number | undefined = undefined;

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
              const start = Number(point.startTimeNanos);
              const end = Number(point.endTimeNanos);
              if (point.value?.[0].intVal && point.value[0].intVal > 1) { 
                 totalSleepSeconds += (end - start) / 1e9;
              }
            }
            if (point.dataTypeName?.includes('weight')) {
                // Pegamos o último valor de peso registrado no período
                const weightValue = point.value?.[0].fpVal;
                if(weightValue) {
                    latestWeight = weightValue;
                }
            }
          }
        }
      }

      return {
        steps: totalSteps > 0 ? totalSteps : undefined,
        calories: totalCalories > 0 ? Math.round(totalCalories) : undefined,
        sleepSeconds: totalSleepSeconds > 0 ? Math.round(totalSleepSeconds) : undefined,
        weight: latestWeight,
      };

    } catch (error) {
      console.error("Falha ao buscar dados agregados do Google Fit:", error);
      return {};
    }
  }
);
