import { useState } from "react";
import { UserPlus } from "lucide-react";
import Swal from "sweetalert2";

export default function AddDriverLayout() {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    address: "",
    driversLicenseNumber: "",
    photoUrl: "",
    frontIdUrl: "",
    backIdUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    Swal.fire({
      title: "Driver Registered!",
      text: "The driver has been successfully added.",
      icon: "success",
      confirmButtonColor: "#059669", // emerald-600
      confirmButtonText: "Continue",
      background: "#f0fdf4",
      color: "#065f46",
      customClass: {
        popup: "rounded-xl shadow-lg",
      },
    });

    // You may clear the form if needed:
    // setForm({...});
  };

  return (
    <div className="flex justify-center w-full">
      <div className="p-6 bg-gray-100 rounded-xl shadow-lg flex flex-col gap-6 w-full max-w-4xl">

        {/* TITLE */}
        <div className="flex items-center gap-2 justify-center">
          <UserPlus className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-700">Driver Registration</h2>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800"
        >
          {/* FULL NAME */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Full Name</label>
            <input
              type="text"
              name="userName"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter full name"
              value={form.userName}
              onChange={handleChange}
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* MOBILE NUMBER */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="09XXXXXXXXX"
              value={form.mobileNumber}
              onChange={handleChange}
            />
          </div>

          {/* ADDRESS */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Address</label>
            <input
              type="text"
              name="address"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* DRIVER LICENSE NUMBER */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Driver License No.</label>
            <input
              type="text"
              name="driversLicenseNumber"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="DL-XXXXX"
              value={form.driversLicenseNumber}
              onChange={handleChange}
            />
          </div>

          {/* PHOTO URL */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Driver Photo URL</label>
            <input
              type="text"
              name="photoUrl"
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="https://image-url"
              value={form.photoUrl}
              onChange={handleChange}
            />
          </div>

          {/* FRONT ID URL */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Front ID URL</label>
            <input
              type="text"
              name="frontIdUrl"
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="https://front-id-url"
              value={form.frontIdUrl}
              onChange={handleChange}
            />
          </div>

          {/* BACK ID URL */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Back ID URL</label>
            <input
              type="text"
              name="backIdUrl"
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="https://back-id-url"
              value={form.backIdUrl}
              onChange={handleChange}
            />
          </div>

          {/* BUTTON */}
          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-xl font-semibold shadow-md transition duration-300"
            >
              Register Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
