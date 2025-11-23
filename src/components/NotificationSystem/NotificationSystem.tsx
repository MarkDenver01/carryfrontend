import { useState } from "react";
import {
  PackageCheck,
  MessageCircle,
  ShieldCheck,
  X,
  CheckCircle2,
} from "lucide-react";

const iconMap: any = {
  PackageCheck,
  MessageCircle,
  ShieldCheck,
};

export type NotificationItem = {
  icon: string;
  color: string;
  message: string;
  read?: boolean;
};

export default function NotificationSystem({
  initialData = [],
}: {
  initialData: NotificationItem[];
}) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialData);

  // ➕ Add new notification
  const addNotification = (notif: NotificationItem) => {
    setNotifications((prev) => [...prev, { ...notif, read: false }]);
  };

  // ✔ Mark as read
  const markRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, read: true } : n))
    );
  };

  // ❌ Delete notification
  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">

      {/* Title */}
      <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-400 bg-clip-text text-transparent mb-2">
        Notifications
      </h2>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-slate-500 text-sm text-center">
            No notifications yet.
          </div>
        ) : (
          notifications.map((item, idx) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={idx}
                className={`
                  flex items-center justify-between p-4 rounded-2xl border shadow-sm
                  backdrop-blur-xl bg-white/80 transition
                  ${item.read ? "opacity-60" : "opacity-100"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-100 shadow-inner">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>

                  <span className="font-medium text-gray-800">
                    {item.message}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!item.read && (
                    <button
                      onClick={() => markRead(idx)}
                      className="p-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 transition"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </button>
                  )}

                  <button
                    onClick={() => removeNotification(idx)}
                    className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 transition"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Demo Add Notification Button */}
      <button
        onClick={() =>
          addNotification({
            icon: "MessageCircle",
            color: "text-blue-600",
            message: "New custom notification added!",
          })
        }
        className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-lg hover:brightness-110 transition"
      >
        + Add Notification
      </button>
    </div>
  );
}
