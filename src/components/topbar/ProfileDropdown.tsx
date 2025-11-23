import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/");
  };

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
        <span className="block truncate text-sm font-medium">
          wrapandcarry@subadmin.com
        </span>
      </DropdownHeader>

      <div className="border-t border-gray-200 mx-2 my-1" />

      <DropdownItem onClick={handleDashboard}>Dashboard</DropdownItem>

      <div className="border-t border-gray-200 mx-2 my-1" />

      <DropdownItem onClick={handleSettings}>Settings</DropdownItem>

      <div className="border-t border-gray-200 mx-2 my-1" />

      <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
    </Dropdown>
  );
}
