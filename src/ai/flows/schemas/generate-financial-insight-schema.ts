
/**
 * @fileOverview Schemas and types for the financial insight generation flow.
 */
import { z } from 'genkit';

const MonthlySpendingSchema = z.object({
  month: z.string(),
  total: z.number(),
  categories: z.record(z.number()),
});

export const GenerateFinancialInsightInputSchema = z.object({
  financialHistory: z.array(MonthlySpendingSchema).describe('An array of the last 3 months of spending data.'),
  goals: z.array(z.string()).describe('A list of the couple\'s active financial goals.'),
});
export type GenerateFinancialInsightInput = z.infer<typeof GenerateFinancialInsightInputSchema>;

export const GenerateFinancialInsightOutputSchema = z.object({
  title: z.string().describe('A catchy title for the financial insight.'),
  insight: z.string().describe('The detailed insight and suggestion for the user. It should be actionable.'),
  suggestedAction: z.object({
    text: z.string(),
    goalToContribute: z.string().optional(),
    amountToContribute: z.number().optional(),
  }).optional().describe('A specific action the user can take.'),
});
export type GenerateFinancialInsightOutput = z.infer<typeof GenerateFinancialInsightOutputSchema>;
