// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "__NEXT_PUBLIC_FIREBASE_API_KEY__",
    authDomain: "__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__",
    projectId: "__NEXT_PUBLIC_FIREBASE_PROJECT_ID__",
    storageBucket: "__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__NEXT_PUBLIC_FIREBASE_APP_ID__",
    databaseURL: "__NEXT_PUBLIC_FIREBASE_DATABASE_URL__",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
