
/**
 * @fileOverview Schemas and types for the financial insight generation flow.
 */
import { z } from 'genkit';

const MonthlySpendingSchema = z.object({
  month: z.string(),
  total: z.number(),
  categories: z.record(z.number()),
});

const GoalProgressSchema = z.object({
    name: z.string(),
    progress: z.number().describe('The completion percentage of the goal.'),
});

const SpendingFeedbackSchema = z.object({
    category: z.string(),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    reason: z.string().optional(),
});

export const GenerateFinancialInsightInputSchema = z.object({
  financialHistory: z.array(MonthlySpendingSchema).describe('An array of the last 2-3 months of spending data.'),
  goals: z.array(GoalProgressSchema).describe('A list of the couple\'s active financial goals and their progress.'),
  spendingFeedback: z.array(SpendingFeedbackSchema).optional().describe('A list of past spending feedbacks.'),
});
export type GenerateFinancialInsightInput = z.infer<typeof GenerateFinancialInsightInputSchema>;

export const GenerateFinancialInsightOutputSchema = z.object({
  title: z.string().describe('A catchy title for the financial insight.'),
  insight: z.string().describe('The detailed insight and suggestion for the user. It should be actionable and encouraging.'),
  suggestedAction: z.object({
    text: z.string().describe('A specific, actionable suggestion for the user.'),
    goalToContribute: z.string().optional().describe('The name of the goal to contribute to, if applicable.'),
    amountToContribute: z.number().optional().describe('The amount to contribute to the goal, if applicable.'),
  }).optional().describe('A specific action the user can take.'),
});
export type GenerateFinancialInsightOutput = z.infer<typeof GenerateFinancialInsightOutputSchema>;
