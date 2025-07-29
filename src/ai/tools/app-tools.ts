
'use server';
/**
 * @fileOverview Application-specific tools for Genkit AI flows.
 *
 * These tools allow the AI to interact with the application's backend services,
 * such as creating calendar events or tasks.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { format, parseISO } from 'date-fns';
import { google } from 'googleapis';

// This will be used to store the OAuth2 client.
// In a real app, you'd manage tokens more robustly (e.g., in a database).
let oauth2Client: any;

function getGoogleAuth(userId: string) {
    if (oauth2Client) return oauth2Client;
    
    // In a real app, you would fetch the user's stored tokens from a secure database
    // using their userId. For this example, we'll simulate it.
    console.log("Simulating fetching Google Auth tokens for user:", userId);

    // This is a placeholder. A real implementation would require a full OAuth2 flow
    // where the user grants permission and you receive and store their tokens.
    // To make this work for testing, you would need to go through the OAuth flow
    // once manually (e.g., via a script) to get a refresh token.
    const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
    
    if (!REFRESH_TOKEN) {
        console.warn("GOOGLE_REFRESH_TOKEN environment variable is not set. Google Calendar API calls will fail.");
        return null;
    }

    oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
    });
    
    return oauth2Client;
}


export const getCalendarEvents = ai.defineTool(
  {
    name: 'getCalendarEvents',
    description: "Fetches events from the user's primary Google Calendar for a given time range.",
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      timeMin: z.string().describe('The start of the time range, in ISO 8601 format.'),
      timeMax: z.string().describe('The end of the time range, in ISO 8601 format.'),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      time: z.string().optional(),
      notes: z.string().optional(),
    })),
  },
  async (input) => {
    try {
      if (!input.userId) {
          console.warn("User ID is missing, cannot fetch calendar events.");
          return [];
      }
      
      const calendar = google.calendar({ 
          version: 'v3', 
          auth: process.env.GOOGLE_PLACES_API_KEY // Using API Key for public calendar read
      });

      // For this to work, the user's primary calendar needs to be public,
      // or the API key needs to be configured with access to it.
      // This is a simplification and has security implications.
      // A full OAuth flow is required for private calendars.
      const calendarId = 'primary'; // This will likely fail without OAuth. A public calendar ID is needed.
      const userProfileRef = ref(getDatabase(firebaseApp), `users/${input.userId}/profile`);
      
      // We will try to get the user's email to use as calendar ID, which might work for public calendars.
      const getEmail = () => new Promise<string|null>((resolve) => {
          onValue(userProfileRef, (snapshot) => {
              resolve(snapshot.val()?.email || null);
          }, { onlyOnce: true });
      });

      const userEmail = await getEmail();

      if (!userEmail) {
          console.error("Could not retrieve user email for calendar ID.");
          return [];
      }

      const response = await calendar.events.list({
        calendarId: userEmail,
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      const events = response.data.items || [];

      return events.map(event => {
        const start = event.start?.dateTime || event.start?.date;
        if (!start) return null; // Skip events without a start date

        const startDate = parseISO(start);
        
        return {
            id: event.id || crypto.randomUUID(),
            title: event.summary || 'Sem Título',
            date: format(startDate, 'yyyy-MM-dd'),
            time: event.start?.dateTime ? format(startDate, 'HH:mm') : undefined,
            notes: event.description || '',
        }
      }).filter(Boolean) as any; // Remove null entries and cast

    } catch (error: any) {
        console.error("Failed to fetch Google Calendar events:", error.message);
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
      
      const auth = getGoogleAuth(input.userId);
      if (!auth) {
          console.error("Google Auth failed. Cannot create Google Calendar event.");
          // We could decide to still create it in Firebase, but for sync, let's fail.
          return { success: false };
      }
      
      const calendar = google.calendar({ version: 'v3', auth });
      const eventStartTime = input.time ? parseISO(`${input.date}T${input.time}:00`) : parseISO(input.date);
      const eventEndTime = input.time ? new Date(eventStartTime.getTime() + 60 * 60 * 1000) : new Date(eventStartTime.getTime() + 24 * 60 * 60 * 1000); // 1 hour duration or all-day

      const event = {
        summary: input.title,
        description: input.notes || '',
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

      let googleEventId;
      try {
        const googleResponse = await calendar.events.insert({
            calendarId: 'primary', // Use the user's primary calendar
            requestBody: event,
        });
        googleEventId = googleResponse.data.id;
        console.log('Event created in Google Calendar:', googleEventId);
      } catch (googleError) {
          console.error("Failed to create Google Calendar event:", googleError);
          // Decide if you still want to create the event in Firebase if Google fails
          // For now, we will return an error.
          return { success: false };
      }

      // If Google event creation was successful, create it in Firebase DB as well
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
    description: "Adds an item to the user's shopping list. If no list exists, it creates one.",
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID. This MUST be provided."),
      itemName: z.string().describe("The name of the item to add, e.g., 'leite' ou '2 pacotes de arroz'."),
      quantity: z.number().optional().describe("The quantity of the item. Defaults to 1."),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      listId: z.string().optional(),
      itemId: z.string().optional(),
    }),
  },
  async (input) => {
      if (!input.userId) {
          console.warn("User ID is missing, cannot add item to shopping list.");
          return { success: false };
      }
      const db = getDatabase(firebaseApp);
      const shoppingListsRef = ref(db, `users/${input.userId}/shoppingLists`);

      return new Promise((resolve) => {
          onValue(shoppingListsRef, async (snapshot) => {
              const lists = snapshot.val();
              let targetListId: string;

              if (lists && Object.keys(lists).length > 0) {
                  // Use the first existing list
                  targetListId = Object.keys(lists)[0];
              } else {
                  // Create a new list if none exist
                  const newListRef = push(shoppingListsRef);
                  targetListId = newListRef.key!;
                  await set(newListRef, { name: 'Lista de Compras', shared: false, items: {} });
              }
              
              const itemsRef = ref(db, `users/${input.userId}/shoppingLists/${targetListId}/items`);
              const newItemRef = push(itemsRef);
              await set(newItemRef, {
                  name: input.itemName,
                  quantity: input.quantity || 1,
                  checked: false,
              });

              resolve({ success: true, listId: targetListId, itemId: newItemRef.key! });
          }, { onlyOnce: true }); // Important to prevent multiple triggers
      });
  }
);
