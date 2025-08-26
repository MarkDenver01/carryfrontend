import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { Bell, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/use_notification";

export default function NotificationDropdown() {
    const notifications = useNotifications();

    return (
        <Dropdown
            className="bg-gray-100 "
            arrowIcon={false}
            inline
            label={
                <div className="relative cursor-pointer">
                    <Bell className="w-8 h-8 text-green-600 hover:text-green-500" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full text-center">
            {notifications.length}
          </span>
                </div>
            }
        >
            <DropdownHeader>
                <span className="block text-sm font-semibold text-gray-900">Notifications</span>
            </DropdownHeader>

            {notifications.map((n, index) => (
                <div key={index}>
                    <DropdownItem>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition duration-150 w-full hover:bg-gray-300">
                            <n.icon size={16} className={n.color} />
                            <span className="text-sm text-gray-800 hover:text-gray-900">{n.message}</span>
                        </div>
                    </DropdownItem>
                    {index < notifications.length - 1 && (
                        <div className="border-t border-gray-300 mx-2" />
                    )}
                </div>
            ))}


            {/* Divider before the final action */}
            <div className="border-t border-gray-200 mx-2 my-1" />

            <DropdownItem>
                <Link
                    to="/notifications"
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition duration-150 w-full hover:bg-blue-50"
                >
                    <Eye size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-600 hover:text-blue-700">View all notifications</span>
                </Link>
            </DropdownItem>

        </Dropdown>
    );
}
