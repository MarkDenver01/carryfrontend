import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import axios from "axios";

/** ✅ Request browser notification permission */
export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("✅ Notification permission granted");
    await generateAndSaveToken();
  } else {
    console.warn("❌ Notification permission denied");
  }
}

/** ✅ Generate FCM Token then send to backend */
async function generateAndSaveToken() {
  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey,
    });

    if (token) {
      console.log("✅ FCM Token:", token);

      // ✅ SEND TOKEN TO BACKEND
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/register-token`,
        {
          token,
          platform: "WEB",
        }
      );
    } else {
      console.warn("⚠ No registration token available");
    }
  } catch (err) {
    console.error("❌ Error getting token:", err);
  }
}

/** ✅ Listen while app is OPEN (foreground) */
export function listenToForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);

    const { title, body } = payload.notification ?? {};

    if (title && body) {
      new Notification(title, {
        body,
        icon: "/vite.svg",
      });
    }
  });
}
