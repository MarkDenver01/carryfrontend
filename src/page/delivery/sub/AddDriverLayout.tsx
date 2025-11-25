import { useState } from "react";
import {
  UserPlus,
  Image as ImageIcon,
  IdCard,
  Phone,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// ⭐ GLOBAL DRIVERS CONTEXT
import { useDrivers, type Rider } from "../../../context/DriverContext";

export default function AddDriverLayout() {
  const { addRider } = useDrivers();
  const navigate = useNavigate();

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
    } as any);

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

    const newDriver: Rider = {
      id: "RDR-" + Math.floor(Math.random() * 900 + 100),
      name: form.userName,
      contact: form.mobileNumber,
      status: "Available",
      ordersToday: 0,
      lastAssigned: "Not yet assigned",
      rating: 0,
      completedDeliveries: 0,
      workload: 0,
      lastActive: "Online now",
      homeBase: form.address,
    };

    // ✅ Save to GLOBAL DriverContext
    addRider(newDriver);

    // ✅ SweetAlert + redirect to Available Riders
    Swal.fire({
      title: "Driver Registered!",
      text: "Redirecting to Available Riders...",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      navigate("/dashboard/delivery/riders");
    });

    handleReset();
  };

  const handleReset = () => {
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
    <div className="w-full min-h-screen bg-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6">
        {/* LEFT: MAIN FORM CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* GRADIENT HEADER */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-full p-2">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Driver Registration
                </h2>
                <p className="text-xs md:text-sm text-emerald-100">
                  Add new delivery partners to your fleet.
                </p>
              </div>
            </div>

            {/* STEP INDICATOR */}
            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Details</span>
              </div>
              <span className="opacity-60">—</span>
              <div className="flex items-center gap-2 opacity-80">
                <div className="w-6 h-6 rounded-full border border-emerald-100 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <span>Upload IDs</span>
              </div>
            </div>
          </div>

          {/* BODY */}
          <form
            onSubmit={handleSubmit}
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
          >
            {/* SECTION: DRIVER INFO CARD */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-100 rounded-full p-1.5">
                  <IdCard className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Driver Information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userName"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="e.g. Juan Dela Cruz"
                    value={form.userName}
                    onChange={handleTextChange}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleTextChange}
                  />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="mobileNumber"
                      maxLength={11}
                      required
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                      placeholder="09XXXXXXXXX"
                      value={form.mobileNumber}
                      onChange={handleTextChange}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    For SMS OTP and delivery contact.
                  </span>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="address"
                      required
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                      placeholder="Street, Barangay, City, Province"
                      value={form.address}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Driver&apos;s License No.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="driversLicenseNumber"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="e.g. N12-34-567890"
                    value={form.driversLicenseNumber}
                    onChange={handleTextChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION: DRIVER IMAGES CARD */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-100 rounded-full p-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Driver Images
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Driver Photo */}
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Driver Photo <span className="text-red-500">*</span>
                  </span>
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                    <span className="text-xs text-slate-600 text-center">
                      Click to upload
                      <br />
                      <span className="text-[11px] text-slate-400">
                        JPG, PNG up to 5MB
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "photo")}
                    />
                  </label>
                  {preview.photo && (
                    <img
                      src={preview.photo}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200 shadow-sm mt-1 transform hover:scale-[1.02] transition"
                    />
                  )}
                </div>

                {/* Front ID */}
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Front ID <span className="text-red-500">*</span>
                  </span>
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                    <IdCard className="w-6 h-6 text-slate-500" />
                    <span className="text-xs text-slate-600 text-center">
                      Upload front of ID
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "frontId")}
                    />
                  </label>
                  {preview.frontId && (
                    <img
                      src={preview.frontId}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200 shadow-sm mt-1 transform hover:scale-[1.02] transition"
                    />
                  )}
                </div>

                {/* Back ID */}
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                    Back ID <span className="text-red-500">*</span>
                  </span>
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                    <IdCard className="w-6 h-6 text-slate-500" />
                    <span className="text-xs text-slate-600 text-center">
                      Upload back of ID
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "backId")}
                    />
                  </label>
                  {preview.backId && (
                    <img
                      src={preview.backId}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200 shadow-sm mt-1 transform hover:scale-[1.02] transition"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-3 mt-2">
              <span className="text-[11px] text-slate-500">
                Review all details before registering the driver. Uploaded images
                will be used for identity verification.
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
                  onClick={handleReset}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Driver
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: SUMMARY / SIDE PANEL */}
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Driver Summary
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Name: </span>
                {form.userName || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Email: </span>
                {form.email || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Mobile: </span>
                {form.mobileNumber || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Address: </span>
                {form.address || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
              <p>
                <span className="font-semibold text-slate-700">License: </span>
                {form.driversLicenseNumber || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-[11px] text-slate-500 mb-2 font-medium">
                Profile Snapshot
              </p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  {preview.photo ? (
                    <img
                      src={preview.photo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserPlus className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  <p className="font-semibold text-slate-700">
                    {form.userName || "New Driver"}
                  </p>
                  <p>{form.email || "No email yet"}</p>
                  <p>{form.mobileNumber || "No contact number yet"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-sm font-semibold text-emerald-800 mb-2">
              Verification Tips
            </p>
            <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
              <li>Ensure driver name matches the ID and license.</li>
              <li>Check that photos are clear and readable.</li>
              <li>Use active mobile number for OTP and contact.</li>
              <li>Keep address accurate for service coverage mapping.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
