importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyA2TQ-p3-VWHuPBSSwkg8DWHsMUK2clu80",
  authDomain: "wrapandcarry-c95b4.firebaseapp.com",
  projectId: "wrapandcarry-c95b4",
  storageBucket: "wrapandcarry-c95b4.appspot.com",
  messagingSenderId: "112696723226",
  appId: "1:112696723226:web:cb258f9f60bb8b25d08ea3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/vite.svg",
  });
});
