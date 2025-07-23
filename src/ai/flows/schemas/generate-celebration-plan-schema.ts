
/**
 * @fileOverview Schemas and types for the celebration plan generation flow.
 */
import { z } from 'genkit';

const WishSchema = z.object({
  name: z.string(),
  price: z.number(),
});

const CouplePreferencesSchema = z.object({
  favoriteFood: z.string().optional(),
  favoritePlace: z.string().optional(),
});

export const GenerateCelebrationPlanInputSchema = z.object({
  dateType: z.string().describe('The type of date, e.g., "Aniversário de Namoro" or "Aniversário".'),
  personName: z.string().optional().describe('The name of the person celebrating, if it is a birthday.'),
  wishList: z.array(WishSchema).describe("A list of wishes from the couple's wish list."),
  couplePreferences: CouplePreferencesSchema.describe('Preferences of the couple.'),
});
export type GenerateCelebrationPlanInput = z.infer<typeof GenerateCelebrationPlanInputSchema>;

export const GenerateCelebrationPlanOutputSchema = z.object({
  title: z.string().describe('A catchy title for the celebration plan.'),
  description: z.string().describe('A short, engaging description of the suggested plan.'),
  giftIdeas: z.array(z.object({
    name: z.string(),
    reason: z.string(),
  })).describe('A list of personalized gift ideas. Prioritize items from the wish list.'),
  celebrationIdeas: z.array(z.object({
    name: z.string(),
    reason: z.string(),
  })).describe('A list of creative celebration ideas, like a special dinner or activity.'),
});
export type GenerateCelebrationPlanOutput = z.infer<typeof GenerateCelebrationPlanOutputSchema>;
