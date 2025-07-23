
'use server';
/**
 * @fileOverview Flow to generate conversation starters for a couple.
 *
 * - generateConversationStarters - A function that suggests topics to discuss.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateConversationStartersOutputSchema = z.object({
    starters: z.array(z.string().describe('A single conversation starter question or topic.')),
});

export async function generateConversationStarters(): Promise<{ starters: string[] }> {
  const { output } = await generateConversationStartersFlow();
  return output || { starters: [] };
}

const prompt = ai.definePrompt({
  name: 'generateConversationStartersPrompt',
  output: { schema: GenerateConversationStartersOutputSchema },
  prompt: `Você é um terapeuta de casais e especialista em comunicação, com um toque divertido e criativo.
Sua tarefa é gerar uma lista de 5 perguntas ou tópicos de conversa para um casal.

As perguntas devem variar em tom e profundidade:
- Inclua pelo menos uma pergunta leve e divertida (ex: "Qual superpoder de casal nós teríamos?").
- Inclua pelo menos uma pergunta sobre memórias ou o passado (ex: "Qual é a sua lembrança favorita do nosso primeiro ano juntos?").
- Inclua pelo menos uma pergunta sobre sonhos e o futuro (ex: "Se dinheiro não fosse um problema, qual seria a nossa próxima grande aventura?").
- Inclua pelo menos uma pergunta que incentive a apreciação mútua (ex: "Qual foi uma pequena coisa que eu fiz esta semana que te fez sorrir?").
- A última pode ser uma pergunta mais profunda ou reflexiva.

Seja criativo e evite clichês óbvios. O objetivo é fortalecer a conexão do casal.
Responda sempre em português do Brasil.
Retorne a lista de 5 perguntas no formato JSON especificado.
`,
});

const generateConversationStartersFlow = ai.defineFlow(
  {
    name: 'generateConversationStartersFlow',
    outputSchema: GenerateConversationStartersOutputSchema,
  },
  async () => {
    const { output } = await prompt({});
    return output!;
  }
);
    
