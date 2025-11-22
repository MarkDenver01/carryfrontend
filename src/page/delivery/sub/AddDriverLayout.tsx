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
import { motion } from "framer-motion";
import { useDrivers } from "../../../context/DriverContext";

export default function AddDriverLayout() {
  const { addDriver } = useDrivers();

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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

  const resetForm = () => {
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

    resetForm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative min-h-[calc(100vh-7rem)] p-4 md:p-6 lg:p-8 flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- GLOBAL BACKDROP (HUD-STYLE) ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Grid */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />
        {/* Ambient Blobs */}
        <motion.div
          className="absolute -top-24 -left-10 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 14, 8, -6, 0],
            y: [0, 12, 22, 3, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-3rem] bottom-[-4rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -18, -10, -4, 0],
            y: [0, -10, -18, -3, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Cursor Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.25), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* ---------- MAIN CARD ---------- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-5xl rounded-[26px] border border-emerald-500/30 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.55)] overflow-hidden"
      >
        {/* HUD Corner Brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative p-5 md:p-7 lg:p-8 flex flex-col gap-7">
          {/* Scanner Line */}
          <motion.div
            className="pointer-events-none absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-18%", "18%", "-18%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* HEADER */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center shadow-md">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Driver Registration
                  </h2>
                  <p className="text-emerald-100 text-xs md:text-sm mt-1">
                    Create a new driver profile and attach required identification
                    documents.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[0.7rem] md:text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-300/40">
                  Secure onboarding pipeline
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950/30 border border-emerald-300/40">
                  ID & license verification
                </span>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
          >
            {/* SECTION TITLE: Driver Info */}
            <div className="col-span-1 md:col-span-2 flex items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <IdCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base text-gray-800">
                    Driver Information
                  </p>
                  <p className="text-[0.7rem] text-gray-500">
                    Basic personal information and contact details.
                  </p>
                </div>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs md:text-sm">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 bg-gray-50/80 shadow-sm gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <FileSignature className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="userName"
                  required
                  placeholder="e.g., Carlos Dela Cruz"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.userName}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs md:text-sm">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 bg-gray-50/80 shadow-sm gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g., driver@example.com"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.email}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            {/* MOBILE NUMBER */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs md:text-sm">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 bg-gray-50/80 shadow-sm gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <Phone className="w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  name="mobileNumber"
                  maxLength={11}
                  required
                  placeholder="09XXXXXXXXX"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.mobileNumber}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs md:text-sm">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 bg-gray-50/80 shadow-sm gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <MapPin className="w-4 h-4 text-red-500" />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g., Barangay 6, Tanauan City, Batangas"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.address}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            {/* LICENSE */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs md:text-sm">
                Driver&apos;s License No. <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 bg-gray-50/80 shadow-sm gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <IdCard className="w-4 h-4 text-gray-700" />
                <input
                  type="text"
                  name="driversLicenseNumber"
                  required
                  placeholder="e.g., N12-34-567890"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.driversLicenseNumber}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            {/* SECTION TITLE: Driver Images */}
            <div className="col-span-1 md:col-span-2 flex items-center justify-between gap-2 border-b pt-2 pb-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base text-gray-800">
                    Driver Images
                  </p>
                  <p className="text-[0.7rem] text-gray-500">
                    Upload a clear photo and both sides of a valid government ID.
                  </p>
                </div>
              </div>
            </div>

            {/* IMAGE UPLOAD CARDS */}
            {[
              { label: "Driver Photo", type: "photo", preview: preview.photo },
              { label: "Front ID", type: "frontId", preview: preview.frontId },
              { label: "Back ID", type: "backId", preview: preview.backId },
            ].map((img, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 ${
                  index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <label className="font-semibold text-xs md:text-sm">
                  {img.label} <span className="text-red-500">*</span>
                </label>

                <label className="border-2 border-dashed rounded-2xl p-4 bg-gray-50/80 flex flex-col items-center justify-center text-xs md:text-sm text-gray-600 cursor-pointer hover:bg-emerald-50/60 hover:border-emerald-400 transition shadow-sm">
                  <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="font-medium">Select Image</span>
                  <span className="text-[0.65rem] text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </span>
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
                  <div className="mt-2">
                    <p className="text-[0.7rem] text-gray-500 mb-1">
                      Preview
                    </p>
                    <img
                      src={img.preview}
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-md"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* BUTTONS */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-700 text-white px-10 py-3 rounded-xl shadow-md font-semibold tracking-wide text-sm md:text-base transition transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                Register Driver
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-xl shadow text-sm md:text-base"
                onClick={resetForm}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
