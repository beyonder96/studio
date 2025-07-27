
'use server';
/**
 * @fileOverview Application-specific tools for Genkit AI flows.
 *
 * These tools allow the AI to interact with the application's backend services,
 * such as creating calendar events or tasks.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { format } from 'date-fns';

export const createCalendarEvent = ai.defineTool(
  {
    name: 'createCalendarEvent',
    description: 'Creates a new event in the couple\'s shared calendar. Use this to schedule dates or appointments.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      title: z.string().describe('The title of the calendar event.'),
      date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
      time: z.string().optional().describe('The time of the event in HH:MM format.'),
      category: z.string().describe('The category of the event, e.g., "Social", "Lazer", "Pessoal".'),
      notes: z.string().optional().describe('Any additional notes for the event.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      eventId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      if (!input.userId) {
          console.warn("User ID is missing, cannot create calendar event.");
          return { success: false };
      }
      
      const db = getDatabase(firebaseApp);
      const appointmentsRef = ref(db, `users/${input.userId}/appointments`);
      const newEventRef = push(appointmentsRef);
      
      await set(newEventRef, {
        title: input.title,
        date: input.date,
        time: input.time || '',
        category: input.category,
        notes: input.notes || '',
      });

      return { success: true, eventId: newEventRef.key || undefined };
    } catch (error) {
      console.error("Failed to create calendar event:", error);
      return { success: false };
    }
  }
);


export const createTask = ai.defineTool(
  {
    name: 'createTask',
    description: 'Adds a new task to the couple\'s shared to-do list. Use this for actions the couple needs to take.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      text: z.string().describe('The description of the task to be created.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      taskId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
        if (!input.userId) {
            console.warn("User ID is missing, cannot create task.");
            return { success: false };
        }

        const db = getDatabase(firebaseApp);
        const tasksRef = ref(db, `users/${input.userId}/tasks`);
        const newTaskRef = push(tasksRef);

        await set(newTaskRef, {
            text: input.text,
            completed: false,
        });

        return { success: true, taskId: newTaskRef.key || undefined };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { success: false };
    }
  }
);

export const addTransaction = ai.defineTool(
    {
      name: 'addTransaction',
      description: 'Adds a new income or expense transaction to the user\'s finance records.',
      inputSchema: z.object({
        userId: z.string().describe("The user's unique ID. This MUST be provided."),
        description: z.string().describe('A brief description of the transaction. Ex: "Almoço", "Gasolina", "Salário"'),
        amount: z.number().describe('The value of the transaction. Always a positive number.'),
        type: z.enum(['income', 'expense']).describe('The type of transaction: "income" for earnings, "expense" for spendings.'),
        category: z.string().describe('The category of the transaction. Ex: "Alimentação", "Transporte", "Moradia", "Salário".'),
        account: z.string().describe('The name of the account or credit card to use. Ex: "Conta Corrente", "Cartão Principal".'),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        transactionId: z.string().optional(),
      }),
    },
    async (input) => {
      try {
        if (!input.userId) {
            console.warn("User ID is missing, cannot add transaction.");
            return { success: false };
        }
        
        const db = getDatabase(firebaseApp);
        const transactionsRef = ref(db, `users/${input.userId}/transactions`);
        const newTransactionRef = push(transactionsRef);
  
        const transactionData = {
          description: input.description,
          amount: input.type === 'expense' ? -Math.abs(input.amount) : Math.abs(input.amount),
          date: format(new Date(), 'yyyy-MM-dd'),
          type: input.type,
          category: input.category,
          account: input.account
        };
  
        await set(newTransactionRef, transactionData);
  
        return { success: true, transactionId: newTransactionRef.key || undefined };
      } catch (error) {
        console.error("Failed to add transaction:", error);
        return { success: false };
      }
    }
  );

export const recordSpendingFeedback = ai.defineTool({
    name: 'recordSpendingFeedback',
    description: 'Records user feedback on a particular spending category.',
    inputSchema: z.object({
        userId: z.string().describe("The user's unique ID. This MUST be provided."),
        category: z.string().describe('The spending category to record feedback for.'),
        sentiment: z.enum(['positive', 'negative', 'neutral']).describe('The user\'s sentiment about spending in this category.'),
        reason: z.string().optional().describe('The user\'s reason for this sentiment.'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
    }),
}, async (input) => {
    if (!input.userId) {
        console.warn("User ID is missing, cannot record spending feedback.");
        return { success: false };
    }
    const db = getDatabase(firebaseApp);
    const feedbackRef = ref(db, `users/${input.userId}/spendingFeedback`);
    const newFeedbackRef = push(feedbackRef);
    await set(newFeedbackRef, { category: input.category, sentiment: input.sentiment, reason: input.reason, timestamp: new Date().toISOString() });
    return { success: true };
});
