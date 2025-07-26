
'use server';
/**
 * @fileOverview Flow to generate conversation starters for a couple.
 *
 * - generateConversationStarters - A function that suggests topics to talk about.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateConversationStartersInputSchema = z.object({
  mood: z.string().describe('The current mood or context, e.g., "light and fun", "deep and meaningful", "planning our future".'),
});
export type GenerateConversationStartersInput = z.infer<typeof GenerateConversationStartersInputSchema>;

const GenerateConversationStartersOutputSchema = z.object({
  starters: z.array(z.string()).describe('A list of 5-7 engaging conversation starters.'),
});
export type GenerateConversationStartersOutput = z.infer<typeof GenerateConversationStartersOutputSchema>;

export async function generateConversationStarters(input: GenerateConversationStartersInput): Promise<GenerateConversationStartersOutput> {
  return generateConversationStartersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationStartersPrompt',
  input: { schema: GenerateConversationStartersInputSchema },
  output: { schema: GenerateConversationStartersOutputSchema },
  prompt: `Você é um terapeuta de casais e especialista em comunicação, com o objetivo de ajudar casais a se conectarem melhor.
Responda sempre em português do Brasil.

Crie uma lista de 5 a 7 perguntas ou tópicos de conversa criativos e envolventes, baseados no seguinte humor ou contexto:
"{{{mood}}}"

As perguntas devem ser abertas e projetadas para incentivar o compartilhamento de histórias, sonhos ou risadas. Evite perguntas de sim/não.

Formate a resposta final no JSON especificado.
`,
});

const generateConversationStartersFlow = ai.defineFlow(
  {
    name: 'generateConversationStartersFlow',
    inputSchema: GenerateConversationStartersInputSchema,
    outputSchema: GenerateConversationStartersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
