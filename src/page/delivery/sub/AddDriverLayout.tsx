import { useState } from "react";
import { UserPlus, Image as ImageIcon, IdCard } from "lucide-react";
import Swal from "sweetalert2";
import { useDrivers } from "../../../context/DriverContext";

export default function AddDriverLayout() {
  const { addDriver } = useDrivers();

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

    setForm((prev) => ({
      ...prev,
      [`${type}File`]: file,
    }));

    if (file) {
      setPreview((prev) => ({
        ...prev,
        [type]: URL.createObjectURL(file),
      }));
    }
  };

  const validate = () => {
    if (form.mobileNumber.length !== 11) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Mobile number must be 11 digits (e.g., 09XXXXXXXXX).",
        icon: "warning",
      });
      return false;
    }

    if (!form.photoFile || !form.frontIdFile || !form.backIdFile) {
      Swal.fire({
        title: "Missing Images",
        text: "Driver Photo, Front ID, and Back ID are required.",
        icon: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newDriver = {
      id: Date.now(),
      ...form,
    };

    addDriver(newDriver);

    Swal.fire({
      title: "Driver Registered!",
      text: "The driver has been successfully added.",
      icon: "success",
    });

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
  };

  return (
    <div className="flex justify-center w-full">
      <div className="p-6 bg-gray-100 rounded-xl shadow-lg flex flex-col gap-6 w-full max-w-4xl">
        <div className="flex items-center gap-2 justify-center">
          <UserPlus className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-700">Driver Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          <div className="col-span-2 font-semibold text-gray-600 flex items-center gap-2">
            <IdCard className="w-4 h-4" />
            Driver Information
          </div>

          <div>
            <label className="font-semibold text-sm">Full Name</label>
            <input
              type="text"
              name="userName"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm"
              value={form.userName}
              onChange={handleTextChange}
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm"
              value={form.email}
              onChange={handleTextChange}
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              maxLength={11}
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm"
              value={form.mobileNumber}
              onChange={handleTextChange}
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Address</label>
            <input
              type="text"
              name="address"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm"
              value={form.address}
              onChange={handleTextChange}
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Driver's License No.</label>
            <input
              type="text"
              name="driversLicenseNumber"
              required
              className="w-full border rounded-xl px-4 py-2 bg-white shadow-sm"
              value={form.driversLicenseNumber}
              onChange={handleTextChange}
            />
          </div>

          <div className="col-span-2 font-semibold text-gray-600 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Driver Images
          </div>

          <div>
            <label className="font-semibold text-sm">Driver Photo</label>
            <input type="file" accept="image/*" className="border rounded-xl p-2 bg-white shadow-sm"
              onChange={(e) => handleFileChange(e, "photo")} />
            {preview.photo && (<img src={preview.photo} className="w-32 h-32 object-cover rounded-xl border mt-2" />)}
          </div>

          <div>
            <label className="font-semibold text-sm">Front ID</label>
            <input type="file" accept="image/*" className="border rounded-xl p-2 bg-white shadow-sm"
              onChange={(e) => handleFileChange(e, "frontId")} />
            {preview.frontId && (<img src={preview.frontId} className="w-32 h-32 object-cover rounded-xl border mt-2" />)}
          </div>

          <div>
            <label className="font-semibold text-sm">Back ID</label>
            <input type="file" accept="image/*" className="border rounded-xl p-2 bg-white shadow-sm"
              onChange={(e) => handleFileChange(e, "backId")} />
            {preview.backId && (<img src={preview.backId} className="w-32 h-32 object-cover rounded-xl border mt-2" />)}
          </div>

          <div className="col-span-2 flex justify-center gap-4 mt-4">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-xl">
              Register Driver
            </button>

            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl"
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
              }}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
