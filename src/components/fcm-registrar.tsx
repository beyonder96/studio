
'use client';

import { useEffect } from 'react';
import { useFCM } from '@/hooks/use-fcm';
import { useAuth } from '@/contexts/auth-context';

export function FcmRegistrar() {
  const { init } = useFCM();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registration successful, scope is:', registration.scope);
          // Agora que o SW está registrado, inicialize o FCM
          init(user.uid);
        }).catch(err => {
          console.error('Service Worker registration failed, error:', err);
        });
    }
  }, [user, init]); // Depende do usuário para garantir que o UID esteja disponível

  return null; // Este componente não renderiza nada na tela
}
