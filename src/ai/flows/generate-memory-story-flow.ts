
'use server';
/**
 * @fileOverview Flow to generate a short, creative story from a memory.
 *
 * - generateMemoryStory - A function that creates a story.
 */

import { ai } from '@/ai/genkit';
import { GenerateMemoryStoryInputSchema, GenerateMemoryStoryOutputSchema, GenerateMemoryStoryInput, GenerateMemoryStoryOutput } from './schemas/generate-memory-story-schema';


export async function generateMemoryStory(input: GenerateMemoryStoryInput): Promise<GenerateMemoryStoryOutput> {
  return generateMemoryStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMemoryStoryPrompt',
  input: { schema: GenerateMemoryStoryInputSchema },
  output: { schema: GenerateMemoryStoryOutputSchema },
  prompt: `Você é um escritor de contos e um poeta, especializado em capturar a essência de momentos especiais de um casal e transformá-los em arte.
Responda sempre em português do Brasil.

Sua tarefa é ler o título e a descrição de uma memória de um casal e escrever uma pequena história ou um poema evocativo sobre ela.

**Memória Fornecida:**
- **Título:** {{{memoryTitle}}}
- **Descrição:** {{{memoryDescription}}}

**Instruções:**
1.  **Não apenas resuma.** Use a descrição como ponto de partida, mas adicione emoção, detalhes sensoriais e um toque de licença poética.
2.  **Crie um Título Artístico:** O título da sua história deve ser inspirado no título da memória, mas mais criativo.
3.  **Mantenha o tom:** A história deve ser romântica, nostálgica ou alegre, dependendo do conteúdo da memória.
4.  **Seja Conciso:** A história ou poema deve ter entre 4 a 6 parágrafos curtos.
5.  **Foque na Emoção:** O mais importante é capturar o sentimento daquele momento.

Formate a resposta final no JSON especificado.
`,
});

const generateMemoryStoryFlow = ai.defineFlow(
  {
    name: 'generateMemoryStoryFlow',
    inputSchema: GenerateMemoryStoryInputSchema,
    outputSchema: GenerateMemoryStoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
