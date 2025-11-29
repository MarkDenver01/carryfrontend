// src/components/driver/AddDriverLayout.tsx
import { useState } from "react";
import {
  UserPlus,
  Image as ImageIcon,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { registerDriver } from "../../../libs/ApiGatewayDatasource";
import { useDrivers } from "../../../context/DriverContext";

export default function AddDriverLayout() {
  const { resetRiders } = useDrivers();
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
        text: "Mobile number must be 11 digits (09XXXXXXXXX).",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("userName", form.userName);
    formData.append("email", form.email);
    formData.append("mobileNumber", form.mobileNumber);
    formData.append("address", form.address);
    formData.append("driversLicenseNumber", form.driversLicenseNumber);
    formData.append("photoFile", form.photoFile!);
    formData.append("frontIdFile", form.frontIdFile!);
    formData.append("backIdFile", form.backIdFile!);

    try {
      await registerDriver(formData);
      await resetRiders();

      Swal.fire({
        title: "Driver Registered!",
        text: "Driver saved successfully.",
        icon: "success",
        confirmButtonColor: "#059669",
      }).then(() => {
        navigate("/dashboard/delivery/riders");
      });

      handleReset();
    } catch (error: any) {
      Swal.fire({
        title: "Registration Failed",
        text: error?.message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full min-h-screen bg-slate-50 flex justify-center px-4 py-10"
    >
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[2.4fr,1.2fr] gap-8">
        {/* LEFT: FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-7 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="bg-white/15 rounded-full p-2.5"
              >
                <UserPlus className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                  Driver Registration
                </h2>
                <p className="text-xs md:text-sm text-emerald-100">
                  Onboard verified delivery partners to your fleet.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="p-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
          >
            {/* DRIVER INFO */}
            <div className="md:col-span-2 border border-slate-200 rounded-xl p-5 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-600 mb-4 uppercase tracking-wide">
                Driver Information
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="Juan Dela Cruz"
                    value={form.userName}
                    onChange={handleTextChange}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleTextChange}
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    maxLength={11}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="09XXXXXXXXX"
                    value={form.mobileNumber}
                    onChange={handleTextChange}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="Street, Barangay, City"
                    value={form.address}
                    onChange={handleTextChange}
                  />
                </div>

                {/* License */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Driver&apos;s License No.
                  </label>
                  <input
                    type="text"
                    name="driversLicenseNumber"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="NXX-XX-XXXXXX"
                    value={form.driversLicenseNumber}
                    onChange={handleTextChange}
                  />
                </div>
              </div>
            </div>

            {/* IMAGES */}
            <div className="md:col-span-2 border border-slate-200 rounded-xl p-5 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-600 mb-4 uppercase tracking-wide">
                Identification Images
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Driver Photo */}
                <motion.div whileHover={{ y: -2 }} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Driver Photo
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl px-3 py-5 cursor-pointer bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                    <ImageIcon className="w-7 h-7 text-emerald-500 mb-1" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG/JPG, max 5MB
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
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-sm mt-1"
                    />
                  )}
                </motion.div>

                {/* Front ID */}
                <motion.div whileHover={{ y: -2 }} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Front ID
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl px-3 py-5 cursor-pointer bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                    <IdCard className="w-7 h-7 text-emerald-500 mb-1" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Clear ID front
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
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-sm mt-1"
                    />
                  )}
                </motion.div>

                {/* Back ID */}
                <motion.div whileHover={{ y: -2 }} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Back ID
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl px-3 py-5 cursor-pointer bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                    <IdCard className="w-7 h-7 text-emerald-500 mb-1" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Clear ID back
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
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-sm mt-1"
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-2 flex justify-end gap-3 mt-1">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors"
                onClick={handleReset}
              >
                Reset
              </button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Register Driver
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* RIGHT: SUMMARY & TIPS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          {/* SUMMARY CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Driver Summary
                </p>
                <p className="text-xs text-slate-500">
                  Review details before saving.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                <span className="font-semibold text-slate-500">Name:</span>{" "}
                {form.userName || <span className="text-slate-400">Not set</span>}
              </p>
              <p>
                <span className="font-semibold text-slate-500">Email:</span>{" "}
                {form.email || <span className="text-slate-400">Not set</span>}
              </p>
              <p>
                <span className="font-semibold text-slate-500">Mobile:</span>{" "}
                {form.mobileNumber || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
              <p>
                <span className="font-semibold text-slate-500">Address:</span>{" "}
                {form.address || <span className="text-slate-400">Not set</span>}
              </p>
              <p>
                <span className="font-semibold text-slate-500">
                  License No.:
                </span>{" "}
                {form.driversLicenseNumber || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
              <div className="rounded-lg bg-emerald-50 text-emerald-700 px-2 py-1 font-medium text-center">
                Identity
              </div>
              <div className="rounded-lg bg-emerald-50 text-emerald-700 px-2 py-1 font-medium text-center">
                Contactable
              </div>
              <div className="rounded-lg bg-emerald-50 text-emerald-700 px-2 py-1 font-medium text-center">
                Verifiable
              </div>
            </div>
          </div>

          {/* TIPS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Verification Guidelines
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
              <li>Ensure driver name matches all uploaded IDs.</li>
              <li>Images must be clear, readable, and not cropped.</li>
              <li>Use an active mobile number that can receive SMS/calls.</li>
              <li>
                Make sure address includes barangay and city for accurate routing.
              </li>
              <li>
                Double-check details before registration to avoid duplicates.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
