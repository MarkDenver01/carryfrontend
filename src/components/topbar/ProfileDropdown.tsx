import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";

export default function ProfileDropdown() {
    return (
        <Dropdown
            className="bg-blend-darken"
            inline
            label={
                <div className="rounded-full transition-all duration-200 hover:scale-105 hover:brightness-105 hover:ring-1 hover:ring-green-600 hover:bg-green-700">
                    <img
                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                        className="w-10 h-10 rounded-full"
                        alt="User avatar"
                    />
                </div>
            }
        >
            <DropdownHeader>
                <span className="block text-sm">Admin</span>
                <span className="block truncate text-sm font-medium">frontendreactcares@admin.com</span>
            </DropdownHeader>
            <div className="border-t border-gray-200 mx-2 my-1" />
            <DropdownItem>Dashboard</DropdownItem>
            <div className="border-t border-gray-200 mx-2 my-1" />
            <DropdownItem>Settings</DropdownItem>
            <div className="border-t border-gray-200 mx-2 my-1" />
            <DropdownItem>Logout</DropdownItem>
        </Dropdown>
    );
}
