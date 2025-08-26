import NotificationDropdown from "./topbar/NotificationDropdown";
import ProfileDropdown from "./topbar/ProfileDropdown";

export default function Topbar({ pageTitle }: { pageTitle: string }) {
    return (
        <nav className="w-full border-b border-gray-200 bg-gray-50 px-4 py-2 shadow-sm flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>

            <div className="flex items-center gap-6">
                {/* Clean and modular */}
                <NotificationDropdown />

                {/* User Avatar Dropdown */}
                <ProfileDropdown/>
            </div>
        </nav>
    );
}
