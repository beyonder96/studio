
/**
 * @fileOverview Schemas and types for the chat processing flow.
 */

import { z } from 'genkit';

const ChatContextSchema = z.object({
  currentDate: z.string().describe("The current date in YYYY-MM-DD format."),
});

export const ProcessChatInputSchema = z.object({
  userId: z.string().describe("The unique ID of the user initiating the command."),
  command: z.string().describe("The user's raw text command."),
  context: ChatContextSchema.optional().describe("Additional context for the command."),
});
export type ProcessChatInput = z.infer<typeof ProcessChatInputSchema>;


export const ProcessChatOutputSchema = z.object({
  answer: z.string().describe("The AI assistant's response to the command."),
});
export type ProcessChatOutput = z.infer<typeof ProcessChatOutputSchema>;
