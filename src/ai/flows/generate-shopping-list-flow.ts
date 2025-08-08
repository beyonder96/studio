
'use server';
/**
 * @fileOverview Flow to generate a structured shopping list from unstructured text.
 *
 * - generateShoppingList - A function that parses text to create a shopping list.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShoppingListInputSchema = z.object({
  text: z.string().describe('The unstructured text containing shopping list items.'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const ShoppingListItemSchema = z.object({
    name: z.string().describe('The name of the shopping item.'),
    quantity: z.number().describe('The quantity of the item. Default to 1 if not specified.'),
});

const GenerateShoppingListOutputSchema = z.object({
  items: z.array(ShoppingListItemSchema).describe('An array of structured shopping list items.'),
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  model: 'googleai/gemini-2.5-pro-latest',
  input: { schema: GenerateShoppingListInputSchema },
  output: { schema: GenerateShoppingListOutputSchema },
  prompt: `You are an expert at parsing unstructured text and converting it into a structured shopping list.
Analyze the following text and extract each item and its quantity. If a quantity is not specified for an item, assume the quantity is 1.
Handle various formats, such as "2 pacotes de arroz", "1kg de carne", "cebola", "1 dúzia de ovos". For items with units like "kg", "L", "pacote", include that in the item name. For "dúzia", convert it to the number 12 for quantity if it makes sense, otherwise keep it simple.

Text to parse:
{{{text}}}
`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
