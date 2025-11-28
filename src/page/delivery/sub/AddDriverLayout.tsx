// src/components/driver/AddDriverLayout.tsx
import { useState } from "react";
import {
  UserPlus,
  Image as ImageIcon,
  IdCard,

} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
    <div className="w-full min-h-screen bg-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
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
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
          >
            {/* DRIVER INFO */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Full Name</label>
                  <input
                    type="text"
                    name="userName"
                    required
                    className="input"
                    placeholder="Juan Dela Cruz"
                    value={form.userName}
                    onChange={handleTextChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleTextChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Mobile</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    maxLength={11}
                    required
                    className="input"
                    placeholder="09XXXXXXXXX"
                    value={form.mobileNumber}
                    onChange={handleTextChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="input"
                    placeholder="Street, Barangay, City"
                    value={form.address}
                    onChange={handleTextChange}
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-semibold">
                    Driver's License No.
                  </label>
                  <input
                    type="text"
                    name="driversLicenseNumber"
                    required
                    className="input"
                    placeholder="NXX-XX-XXXXXX"
                    value={form.driversLicenseNumber}
                    onChange={handleTextChange}
                  />
                </div>
              </div>
            </div>

            {/* IMAGES */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Photo */}
                <div>
                  <label className="text-xs font-semibold">Driver Photo</label>
                  <label className="upload-box">
                    <ImageIcon className="icon" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "photo")}
                    />
                  </label>
                  {preview.photo && (
                    <img src={preview.photo} className="preview-img" />
                  )}
                </div>

                {/* Front ID */}
                <div>
                  <label className="text-xs font-semibold">Front ID</label>
                  <label className="upload-box">
                    <IdCard className="icon" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "frontId")}
                    />
                  </label>
                  {preview.frontId && (
                    <img src={preview.frontId} className="preview-img" />
                  )}
                </div>

                {/* Back ID */}
                <div>
                  <label className="text-xs font-semibold">Back ID</label>
                  <label className="upload-box">
                    <IdCard className="icon" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "backId")}
                    />
                  </label>
                  {preview.backId && (
                    <img src={preview.backId} className="preview-img" />
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="md:col-span-2 flex justify-end gap-4 mt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                Reset
              </button>

              <button type="submit" className="btn-primary">
                <UserPlus className="w-4 h-4" /> Register Driver
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="summary-card">
            <p className="title">Driver Summary</p>
            <div className="info">
              <p><b>Name:</b> {form.userName || "Not set"}</p>
              <p><b>Email:</b> {form.email || "Not set"}</p>
              <p><b>Mobile:</b> {form.mobileNumber || "Not set"}</p>
              <p><b>Address:</b> {form.address || "Not set"}</p>
              <p><b>License:</b> {form.driversLicenseNumber || "Not set"}</p>
            </div>
          </div>

          <div className="tips-card">
            <p className="title">Verification Tips</p>
            <ul>
              <li>Ensure driver name matches ID</li>
              <li>Images must be readable</li>
              <li>Use active mobile number</li>
              <li>Accurate address helps routing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
