
import {  createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
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

type NotificationContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markAllAsRead: () => void;
  markAsRead: (id: number) => void;
  removeNotification: (id: number) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

let globalId = 1;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (payload: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markAsRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const removeNotification = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        markAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
