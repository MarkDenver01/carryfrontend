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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
  };
}
