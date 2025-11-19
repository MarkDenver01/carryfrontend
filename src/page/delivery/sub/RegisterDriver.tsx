import { useState } from "react";
import { UserPlus, Image as ImageIcon, IdCard } from "lucide-react";
import Swal from "sweetalert2";

export default function AddDriverLayout() {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    address: "",
    driversLicenseNumber: "",
    photoFile: null as File | null,
    frontIdFile: null as File | null,
    backIdFile: null as File | null,
  });

  const [preview, setPreview] = useState({
    photo: "",
    frontId: "",
    backId: "",
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "frontId" | "backId"
  ) => {
    const file = e.target.files?.[0] || null;

    setForm({
      ...form,
      [`${type}File`]: file,
    });

    if (file) {
      setPreview({
        ...preview,
        [type]: URL.createObjectURL(file),
      });
    }
  };

  const validate = () => {
    if (form.mobileNumber.length !== 11) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Mobile number must be 11 digits (e.g., 09XXXXXXXXX).",
        icon: "warning",
        confirmButtonColor: "#d97706",
      });
      return false;
    }

    if (!form.photoFile || !form.frontIdFile || !form.backIdFile) {
      Swal.fire({
        title: "Missing Images",
        text: "Please upload Driver Photo, Front ID, and Back ID.",
        icon: "warning",
        confirmButtonColor: "#d97706",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    Swal.fire({
      title: "Driver Registered!",
      text: "The driver has been successfully added.",
      icon: "success",
      confirmButtonColor: "#059669",
      background: "#f0fdf4",
      color: "#065f46",
      customClass: { popup: "rounded-xl shadow-lg" },
    });
  };

  return (
    <div className="flex justify-center w-full">
      <div className="p-6 bg-gray-100 rounded-xl shadow-lg flex flex-col gap-6 w-full max-w-4xl">

        {/* HEADER */}
        <div className="flex items-center gap-2 justify-center">
          <UserPlus className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-700">Driver Registration</h2>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
        >
          {/* SECTION 1 */}
          <div className="col-span-2 text-sm font-semibold text-gray-600 flex items-center gap-2">
            <IdCard className="w-4 h-4" />
            Driver Information
          </div>

          {/* FIELDS */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Full Name</label>
            <input
              type="text"
              name="userName"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter full name"
              value={form.userName}
              onChange={handleTextChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleTextChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              maxLength={11}
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="09XXXXXXXXX"
              value={form.mobileNumber}
              onChange={handleTextChange}
            />
          </div>

          {/* ADDRESS — MAP PIN REMOVED */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Address</label>
            <input
              type="text"
              name="address"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter address"
              value={form.address}
              onChange={handleTextChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Driver's License No.</label>
            <input
              type="text"
              name="driversLicenseNumber"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="DL-XXXXX"
              value={form.driversLicenseNumber}
              onChange={handleTextChange}
            />
          </div>

          {/* SECTION 2 */}
          <div className="col-span-2 text-sm font-semibold text-gray-600 flex items-center gap-2 mt-2">
            <ImageIcon className="w-4 h-4" />
            Driver Images
          </div>

          {/* UPLOAD: DRIVER PHOTO */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Driver Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "photo")}
              className="border rounded-xl p-2 bg-white shadow-sm"
            />
            {preview.photo && (
              <img
                src={preview.photo}
                className="w-32 h-32 object-cover rounded-xl border shadow-sm mt-2"
              />
            )}
          </div>

          {/* UPLOAD: FRONT ID */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Front ID</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "frontId")}
              className="border rounded-xl p-2 bg-white shadow-sm"
            />
            {preview.frontId && (
              <img
                src={preview.frontId}
                className="w-32 h-32 object-cover rounded-xl border shadow-sm mt-2"
              />
            )}
          </div>

          {/* UPLOAD: BACK ID */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Back ID</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "backId")}
              className="border rounded-xl p-2 bg-white shadow-sm"
            />
            {preview.backId && (
              <img
                src={preview.backId}
                className="w-32 h-32 object-cover rounded-xl border shadow-sm mt-2"
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className="col-span-2 flex justify-center gap-4 mt-4">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-xl font-semibold shadow-md transition duration-300"
            >
              Register Driver
            </button>

            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl shadow-sm"
              onClick={() => {
                setForm({
                  userName: "",
                  email: "",
                  mobileNumber: "",
                  address: "",
                  driversLicenseNumber: "",
                  photoFile: null,
                  frontIdFile: null,
                  backIdFile: null,
                });
                setPreview({ photo: "", frontId: "", backId: "" });
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
