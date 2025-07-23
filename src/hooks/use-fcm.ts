
'use client';

import { useState, useEffect, useCallback } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { getDatabase, ref, set } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { useToast } from './use-toast';

export function useFCM() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const saveTokenToDb = useCallback(async (token: string, userId: string) => {
    try {
      const db = getDatabase(firebaseApp);
      const tokenRef = ref(db, `users/${userId}/fcmTokens/${token}`);
      await set(tokenRef, true);
    } catch (error) {
      console.error('Error saving FCM token to database', error);
    }
  }, []);

  const requestPermission = useCallback(async (userId?: string) => {
    if (!messaging || !userId) return;

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
          await saveTokenToDb(currentToken, userId);
          toast({
            title: 'Notificações Ativadas!',
            description: 'Você receberá alertas importantes.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao obter token',
            description: 'Não foi possível obter o token de notificação.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Permissão Negada',
          description: 'Você precisa permitir as notificações nas configurações do seu navegador.',
        });
      }
    } catch (error) {
      console.error('An error occurred while requesting permission. ', error);
      toast({
        variant: 'destructive',
        title: 'Erro de Notificação',
        description: 'Ocorreu um erro ao tentar ativar as notificações.',
      });
    }
  }, [saveTokenToDb, toast]);
  
  const init = useCallback((userId: string) => {
      if(messaging) {
        // Handle foreground messages
        onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
            });
        });

        // If permission is already granted, get the token
        if (Notification.permission === 'granted') {
             getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            }).then(token => {
                if(token) saveTokenToDb(token, userId);
            }).catch(err => console.error("Could not get token on init", err));
        }
      }
  }, [saveTokenToDb, toast]);

  return { permission, requestPermission, init };
}
