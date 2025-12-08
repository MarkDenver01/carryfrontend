// src/hooks/use_notification.ts
import { useState } from "react";
import { Bell } from "lucide-react";

export type NotificationIcon = typeof Bell;

export type NotificationItem = {
  id: number;
  message: string;
  icon: NotificationIcon;
  color: string;
  createdAt: Date;
  read: boolean;
  type?: string;
  orderId?: string;
};

let globalId = 1;

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: globalId++,
      message: "Sample new order received.",
      icon: Bell,
      color: "text-green-600",
      createdAt: new Date(),
      read: false,
    },
  ]);

  // 🔥 ADD NOTIFICATION (pang test & real usage)
const addNotification = (payload: {
  message: string;
  icon: NotificationIcon;
  color: string;
  type?: string;
  orderId?: string;
}) => {
  setNotifications((prev) => [
    {
      id: globalId++,
      message: payload.message,
      icon: payload.icon,
      color: payload.color,
      createdAt: new Date(),
      read: false,
      type: payload.type,
      orderId: payload.orderId,
    },
    ...prev,
  ]);
};

  // UNREAD COUNT
  const unreadCount = notifications.filter((n) => !n.read).length;

  // MARK ALL READ
  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // MARK ONE READ
  const markAsRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  // REMOVE NOTIFICATION
  const removeNotification = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
    addNotification, // 🔥 IMPORTANTE
  };
}
