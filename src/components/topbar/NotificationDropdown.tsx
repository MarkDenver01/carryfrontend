import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { Bell, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/use_notification";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationDropdown() {
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    removeNotification,
    unreadCount,
  } = useNotifications();

  return (
    <Dropdown
      className="bg-white shadow-md w-80"
      arrowIcon={false}
      inline
      label={
        <div className="relative cursor-pointer" onClick={markAllAsRead}>
          <Bell className="w-7 h-7 text-green-600 hover:text-green-500" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-[6px] py-[1px] text-[10px] font-bold text-white bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      }
    >
      {/* Header */}
      <DropdownHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            Notifications
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            className="text-[11px] text-blue-600 hover:underline"
          >
            Mark all read
          </button>
        </div>
      </DropdownHeader>

      {/* List Items */}
      <div className="max-h-60 overflow-y-auto px-1">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <DropdownItem onClick={() => markAsRead(n.id)}>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    <n.icon size={16} className={n.color} />
                    <span
                      className={`text-sm ${
                        n.read ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {n.message}
                    </span>
                  </div>

                  {/* Remove button (hover only) */}
                  <XCircle
                    size={16}
                    className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                  />
                </div>
              </DropdownItem>

              <div className="border-t border-gray-200 mx-2" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <DropdownItem>
        <Link
          to="/notifications"
          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition duration-150 w-full hover:bg-blue-50"
        >
          <Eye size={16} className="text-blue-600" />
          <span className="text-sm text-blue-600 hover:text-blue-700">
            View all notifications
          </span>
        </Link>
      </DropdownItem>
    </Dropdown>
  );
}
