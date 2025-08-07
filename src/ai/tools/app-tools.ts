'use server';
/**
 * @fileOverview Application-specific tools for Genkit AI flows.
 *
 * These tools allow the AI to interact with the application's backend services,
 * such as creating calendar events or tasks.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDatabase, ref, push, set, onValue, remove, get } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { format, parseISO } from 'date-fns';
import { google } from 'googleapis';
import type {Auth, OAuth2Client} from 'google-auth-library';


function getGoogleAuthClient(accessToken: string): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

export const getCalendarEvents = ai.defineTool(
    {
        name: 'getCalendarEvents',
        description: 'Retrieves the next 20 events from all of the user\'s Google Calendars using their access token.',
        inputSchema: z.object({
            accessToken: z.string().describe("The user's Google OAuth2 access token."),
        }),
        outputSchema: z.array(z.object({
            id: z.string(),
            title: z.string(),
            date: z.string(),
            time: z.string().optional(),
            isGoogleEvent: z.boolean(),
        })),
    },
    async ({ accessToken }) => {
        const authClient = getGoogleAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        try {
            // First, get a list of all calendars the user has access to
            const calendarListResponse = await calendar.calendarList.list();
            const calendars = calendarListResponse.data.items;
            if (!calendars) return [];

            const allEventsPromises = calendars.map(cal => 
                calendar.events.list({
                    calendarId: cal.id!,
                    timeMin: new Date().toISOString(),
                    maxResults: 20, // Per calendar
                    singleEvents: true,
                    orderBy: 'startTime',
                })
            );

            const allEventResponses = await Promise.all(allEventsPromises);
            const allEvents = allEventResponses.flatMap(res => res.data.items || []);
            
            if (allEvents.length === 0) {
                return [];
            }

            const formattedEvents = allEvents.map(event => {
                if (!event) return null;
                const start = event.start?.dateTime || event.start?.date;
                if (!start) return null;

                const date = parseISO(start);
                return {
                    id: event.id!,
                    title: event.summary || 'Sem Título',
                    date: format(date, 'yyyy-MM-dd'),
                    time: event.start?.dateTime ? format(date, 'HH:mm') : undefined,
                    isGoogleEvent: true,
                };
            }).filter(Boolean);
            
            // Sort all events by date and return the top 20 upcoming
            return formattedEvents
              .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
              .slice(0, 20) as any[];

        } catch (error) {
            console.error("Failed to fetch Google Calendar events:", error);
            // This could be an auth error if the token is invalid or expired.
            // The client should handle this and potentially prompt for re-authentication.
            return [];
        }
    }
);


export const createCalendarEvent = ai.defineTool(
  {
    name: 'createCalendarEvent',
    description: 'Creates a new event in the couple\'s shared calendar and syncs it with Google Calendar. Use this to schedule dates or appointments.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      accessToken: z.string().optional().describe("The user's Google OAuth2 access token. Required to create a Google Calendar event."),
      title: z.string().describe('The title of the calendar event.'),
      date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
      time: z.string().optional().describe('The time of the event in HH:MM format.'),
      category: z.string().describe('The category of the event, e.g., "Social", "Lazer", "Pessoal".'),
      notes: z.string().optional().describe('Any additional notes for the event.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      eventId: z.string().optional(),
      googleEventId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      if (!input.userId) {
          console.warn("User ID is missing, cannot create calendar event.");
          return { success: false };
      }
      
      let googleEventId: string | null | undefined;
      
      if (input.accessToken) {
        const authClient = getGoogleAuthClient(input.accessToken);
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        const eventStartTime = input.time ? parseISO(`${input.date}T${input.time}:00`) : parseISO(input.date);
        const eventEndTime = input.time ? new Date(eventStartTime.getTime() + 60 * 60 * 1000) : new Date(eventStartTime.getTime() + 24 * 60 * 60 * 1000); // 1 hour duration or all-day
        
        const description = `Categoria: ${input.category}\n\n${input.notes || ''}`;

        const event = {
          summary: input.title,
          description: description,
          start: {
            dateTime: input.time ? eventStartTime.toISOString() : undefined,
            date: !input.time ? input.date : undefined,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: input.time ? eventEndTime.toISOString() : undefined,
            date: !input.time ? input.date : undefined,
            timeZone: 'America/Sao_Paulo',
          },
        };

        try {
          const googleResponse = await calendar.events.insert({
              calendarId: 'primary',
              requestBody: event,
          });
          googleEventId = googleResponse.data.id;
          console.log('Event created in Google Calendar:', googleEventId);
        } catch (googleError) {
            console.error("Failed to create Google Calendar event:", googleError);
            // Don't block firebase creation if google fails
        }
      }


      // Create it in Firebase DB
      const db = getDatabase(firebaseApp);
      const appointmentsRef = ref(db, `users/${input.userId}/appointments`);
      const newEventRef = push(appointmentsRef);
      
      await set(newEventRef, {
        title: input.title,
        date: input.date,
        time: input.time || '',
        category: input.category,
        notes: input.notes || '',
        googleEventId: googleEventId || null,
      });

      return { success: true, eventId: newEventRef.key || undefined, googleEventId: googleEventId || undefined };

    } catch (error) {
      console.error("Failed to create calendar event:", error);
      return { success: false };
    }
  }
);

export const updateGoogleCalendarEvent = ai.defineTool(
    {
        name: 'updateGoogleCalendarEvent',
        description: 'Updates an existing event in Google Calendar.',
        inputSchema: z.object({
            accessToken: z.string().describe("The user's Google OAuth2 access token."),
            eventId: z.string().describe('The ID of the Google Calendar event to update.'),
            title: z.string().describe('The updated title.'),
            date: z.string().describe('The updated date in YYYY-MM-DD format.'),
            time: z.string().optional().describe('The updated time in HH:MM format.'),
            notes: z.string().optional().describe('Updated notes for the event.'),
            category: z.string().describe('The category of the event, e.g., "Social", "Lazer", "Pessoal".'),
        }),
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ accessToken, eventId, title, date, time, notes, category }) => {
        const authClient = getGoogleAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const eventStartTime = time ? parseISO(`${date}T${time}:00`) : parseISO(date);
        const eventEndTime = time ? new Date(eventStartTime.getTime() + 60 * 60 * 1000) : new Date(eventStartTime.getTime() + 24 * 60 * 60 * 1000);

        const description = `Categoria: ${category}\n\n${notes || ''}`;

        const event = {
            summary: title,
            description: description,
            start: {
                dateTime: time ? eventStartTime.toISOString() : undefined,
                date: !time ? date : undefined,
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: time ? eventEndTime.toISOString() : undefined,
                date: !time ? date : undefined,
                timeZone: 'America/Sao_Paulo',
            },
        };

        try {
            await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: event,
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to update Google Calendar event:", error);
            return { success: false };
        }
    }
);

export const deleteGoogleCalendarEvent = ai.defineTool(
    {
        name: 'deleteGoogleCalendarEvent',
        description: 'Deletes an event from Google Calendar.',
        inputSchema: z.object({
            accessToken: z.string().describe("The user's Google OAuth2 access token."),
            eventId: z.string().describe('The ID of the Google Calendar event to delete.'),
        }),
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ accessToken, eventId }) => {
        const authClient = getGoogleAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to delete Google Calendar event:", error);
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

export const addItemToShoppingList = ai.defineTool(
  {
    name: 'addItemToShoppingList',
    description: "Adds one or more items to the user's shopping list. If no list exists, it creates one.",
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      items: z.array(z.string()).describe("An array of item names to add, e.g., ['leite', 'pão', 'ovos']."),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ userId, items }) => {
      if (!userId) {
          return { success: false, message: 'ID do usuário não fornecido.' };
      }
      try {
        const db = getDatabase(firebaseApp);
        const shoppingListsRef = ref(db, `users/${userId}/shoppingLists`);

        const snapshot = await get(shoppingListsRef);
        const lists = snapshot.val();
        let targetListId: string;

        if (lists && Object.keys(lists).length > 0) {
            targetListId = Object.keys(lists)[0];
        } else {
            const newListRef = push(shoppingListsRef);
            targetListId = newListRef.key!;
            await set(newListRef, { name: 'Lista de Compras', shared: false, items: {} });
        }
        
        const itemsRef = ref(db, `users/${userId}/shoppingLists/${targetListId}/items`);
        for (const itemName of items) {
          const newItemRef = push(itemsRef);
          await set(newItemRef, {
            name: itemName,
            quantity: 1,
            checked: false,
          });
        }
        
        return { success: true, message: `${items.join(', ')} adicionado(s) à lista de compras.` };
      } catch (error) {
        console.error("Erro ao adicionar item à lista de compras:", error);
        return { success: false, message: 'Ocorreu um erro ao adicionar o item.' };
      }
  }
);


export const getTransactions = ai.defineTool(
  {
    name: 'getTransactions',
    description: 'Retrieves a list of financial transactions based on specified filters like time period, account, or description.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      month: z.number().optional().describe('The month to filter by (1-12).'),
      year: z.number().optional().describe('The year to filter by (e.g., 2024).'),
      accountName: z.string().optional().describe('The name of the account or credit card to filter by.'),
      descriptionQuery: z.string().optional().describe('A keyword to search for in the transaction description (e.g., "iFood").'),
    }),
    outputSchema: z.array(z.object({
        description: z.string(),
        amount: z.number(),
        date: z.string(),
        category: z.string(),
    })),
  },
  async ({ userId, month, year, accountName, descriptionQuery }) => {
    if (!userId) {
      console.warn("User ID is missing, cannot get transactions.");
      return [];
    }
    const db = getDatabase(firebaseApp);
    const transactionsRef = ref(db, `users/${userId}/transactions`);
    
    const snapshot = await get(transactionsRef);
    if (!snapshot.exists()) {
      return [];
    }

    const allTransactions = Object.values(snapshot.val() as Record<string, any>);

    const filteredTransactions = allTransactions.filter(t => {
      let matches = true;

      if (year && month) {
        const transactionDate = parseISO(t.date);
        matches = matches && transactionDate.getFullYear() === year && transactionDate.getMonth() + 1 === month;
      }
      if (accountName) {
        matches = matches && t.account === accountName;
      }
      if (descriptionQuery) {
        matches = matches && t.description.toLowerCase().includes(descriptionQuery.toLowerCase());
      }
      
      return matches;
    });

    return filteredTransactions.map(({ description, amount, date, category }) => ({
        description,
        amount,
        date,
        category,
    }));
  }
);
