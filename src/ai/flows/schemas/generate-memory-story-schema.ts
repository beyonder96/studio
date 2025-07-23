
/**
 * @fileOverview Schemas and types for the memory story generation flow.
 */
import { z } from 'genkit';

export const GenerateMemoryStoryInputSchema = z.object({
  memoryTitle: z.string().describe('The title of the memory.'),
  memoryDescription: z.string().describe('The user-provided description of the memory.'),
});
export type GenerateMemoryStoryInput = z.infer<typeof GenerateMemoryStoryInputSchema>;

export const GenerateMemoryStoryOutputSchema = z.object({
  title: z.string().describe('A creative title for the generated story, inspired by the memory title.'),
  story: z.string().describe('A short, creative story or poem (4-6 paragraphs) based on the memory. It should be evocative and artistic, not just a summary.'),
});
export type GenerateMemoryStoryOutput = z.infer<typeof GenerateMemoryStoryOutputSchema>;
