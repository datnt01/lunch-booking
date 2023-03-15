// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')
import { firebaseConfig } from '../src/server/firebase'

firebase.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.data.title
  const notificationOptions = {
    body: payload.data.body,
    webpush: {
      fcm_options: {
        link: 'https://google.com',
      },
    },
  }
  self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(self.clients.openWindow('https://lunch-booking-happy-lunch.vercel.app/'))
  })
  self.registration.showNotification(notificationTitle, notificationOptions)
})
