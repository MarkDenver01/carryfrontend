import { useState } from "react";
import {
  UserPlus,
  Image as ImageIcon,
  IdCard,
  MapPin,
  Phone,
  Mail,
  FileSignature,
  UploadCloud,
} from "lucide-react";
import Swal from "sweetalert2";

// 👉 REAL BACKEND API (IMPORTANT)
import { registerDriver } from "../../../libs/ApiGatewayDatasource";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("userName", form.userName);
    formData.append("email", form.email);
    formData.append("mobileNumber", form.mobileNumber);
    formData.append("address", form.address);
    formData.append("driversLicenseNumber", form.driversLicenseNumber);

    if (form.photoFile) formData.append("photoFile", form.photoFile);
    if (form.frontIdFile) formData.append("frontIdFile", form.frontIdFile);
    if (form.backIdFile) formData.append("backIdFile", form.backIdFile);

    try {
      // ⭐ REAL BACKEND SAVE
      const saved = await registerDriver(formData);

      Swal.fire({
        title: "Driver Registered!",
        text: "Driver added successfully.",
        icon: "success",
      });

      console.log("Saved Driver:", saved);

      // Reset form
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

    } catch (error: any) {
      Swal.fire({
        title: "Registration Failed",
        text: error.message ?? "Something went wrong",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex justify-center w-full px-4 md:px-0">
      <div className="p-6 bg-white rounded-2xl shadow-xl flex flex-col gap-8 w-full max-w-4xl border border-gray-200">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <UserPlus className="w-7 h-7" />
            <h2 className="text-2xl font-bold">Driver Registration</h2>
          </div>
          <p className="text-emerald-100 mt-1 text-sm">
            Add a new driver and upload required identification documents.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
        >
          {/* SECTION TITLE */}
          <div className="col-span-2 font-semibold text-gray-700 flex items-center gap-2 text-lg border-b pb-2">
            <IdCard className="w-5 h-5 text-emerald-600" />
            Driver Information
          </div>

          {/* FULL NAME */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Full Name</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 shadow-sm gap-2">
              <FileSignature className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="userName"
                required
                className="w-full bg-transparent outline-none"
                value={form.userName}
                onChange={handleTextChange}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Email</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 shadow-sm gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-transparent outline-none"
                value={form.email}
                onChange={handleTextChange}
              />
            </div>
          </div>

          {/* MOBILE NUMBER */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Mobile Number</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 shadow-sm gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <input
                type="text"
                name="mobileNumber"
                maxLength={11}
                required
                className="w-full bg-transparent outline-none"
                value={form.mobileNumber}
                onChange={handleTextChange}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Address</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 shadow-sm gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <input
                type="text"
                name="address"
                required
                className="w-full bg-transparent outline-none"
                value={form.address}
                onChange={handleTextChange}
              />
            </div>
          </div>

          {/* LICENSE */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Driver's License No.</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 shadow-sm gap-2">
              <IdCard className="w-4 h-4 text-gray-700" />
              <input
                type="text"
                name="driversLicenseNumber"
                required
                className="w-full bg-transparent outline-none"
                value={form.driversLicenseNumber}
                onChange={handleTextChange}
              />
            </div>
          </div>

          {/* SECTION TITLE */}
          <div className="col-span-2 font-semibold text-gray-700 flex items-center gap-2 text-lg border-b pb-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            Driver Images
          </div>

          {/* IMAGE UPLOAD COMPONENT */}
          {[
            { label: "Driver Photo", type: "photo", preview: preview.photo },
            { label: "Front ID", type: "frontId", preview: preview.frontId },
            { label: "Back ID", type: "backId", preview: preview.backId },
          ].map((img, index) => (
            <div key={index} className="flex flex-col gap-2">
              <label className="font-semibold text-sm">{img.label}</label>

              <label className="border-2 border-dashed rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition shadow-sm">
                <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                <span>Select Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      img.type as "photo" | "frontId" | "backId"
                    )
                  }
                />
              </label>

              {img.preview && (
                <img
                  src={img.preview}
                  className="w-32 h-32 object-cover rounded-xl border shadow"
                />
              )}
            </div>
          ))}

          {/* BUTTONS */}
          <div className="col-span-2 flex justify-center gap-6 mt-6">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl shadow-md font-semibold tracking-wide"
            >
              Register Driver
            </button>

            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-3 rounded-xl shadow"
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
