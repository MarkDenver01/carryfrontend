import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import axios from "axios";
import { Bell, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { useNotifications } from "../hooks/use_notification";

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("✅ Notification permission granted");
    await generateAndSaveToken();
  } else {
    console.warn("❌ Notification permission denied");
  }
}

async function generateAndSaveToken() {
  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    const token = await getToken(messaging, { vapidKey });

    if (token) {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/register-token`,
        {
          token,
          platform: "WEB",
        }
      );
    }
  } catch (err) {
    console.error("❌ Error getting token:", err);
  }
}

/** ✅ REALTIME LISTENER → DROPDOWN + HISTORY */
export function useFcmForegroundListener() {
  const { addNotification } = useNotifications();

  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);

    const { title, body } = payload.notification ?? {};
    const type = payload.data?.type;
    const orderId = payload.data?.orderId;

    if (title && body) {
      // ✅ Browser popup
      new Notification(title, {
        body,
        icon: "/vite.svg",
      });

      // ✅ DROPDOWN + HISTORY
      addNotification({
        message: body,
        icon: resolveIcon(type),
        color: resolveColor(type),
        type,
        orderId,
      });
    }
  });
}

function resolveIcon(type?: string) {
  if (type === "ORDER_ACCEPTED") return CheckCircle;
  if (type === "ORDER_CANCELLED") return XCircle;
  if (type === "ORDER_PLACED") return ShoppingCart;
  return Bell;
}

function resolveColor(type?: string) {
  if (type === "ORDER_ACCEPTED") return "text-green-600";
  if (type === "ORDER_CANCELLED") return "text-red-600";
  if (type === "ORDER_PLACED") return "text-blue-600";
  return "text-gray-600";
}
