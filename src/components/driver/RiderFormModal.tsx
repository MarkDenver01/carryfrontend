import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void; // add or update
  initialData: any | null; // null = ADD, object = EDIT
};

export default function RiderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    homeBase: "",
    status: "Available",
    ordersToday: 0,
  });

  // LOAD FORM DATA
  useEffect(() => {
    if (initialData) {
      // EDIT MODE
      setForm({
        name: initialData.name,
        contact: initialData.contact,
        homeBase: initialData.homeBase,
        status: initialData.status,
        ordersToday: initialData.ordersToday ?? 0,
      });
    } else {
      // ADD MODE
      setForm({
        name: "",
        contact: "",
        homeBase: "",
        status: "Available",
        ordersToday: 0,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const fieldClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const handleSubmit = () => {
  if (!form.name.trim()) {
    alert("Name is required");
    return;
  }

  if (!initialData) {
    // ADD MODE → create a full Rider object
    const newRider = {
      id: "RDR-" + Math.floor(Math.random() * 90000 + 10000),
      name: form.name,
      contact: form.contact,
      homeBase: form.homeBase,
      status: form.status,
      ordersToday: form.ordersToday,
      lastAssigned: "Not Assigned",
      rating: 5.0,
      completedDeliveries: 0,
      workload: 0,
      lastActive: "Online now",
    };

    onSubmit(newRider);  // 🚀 PASS FULL RIDER OBJECT
  } else {
    // EDIT MODE
    onSubmit(form);
  }

  onClose();
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {initialData ? "Edit Rider" : "Register Rider"}
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 font-medium">Name</label>
          <input
            className={fieldClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>

        {/* Contact */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 font-medium">Contact</label>
          <input
            className={fieldClass}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="0917 XXX XXXX"
          />
        </div>

        {/* Home Base */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 font-medium">Home Base</label>
          <input
            className={fieldClass}
            value={form.homeBase}
            onChange={(e) => setForm({ ...form, homeBase: e.target.value })}
            placeholder="e.g. Tanauan City"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 font-medium">Status</label>
          <select
            className={fieldClass}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Available</option>
            <option>On Delivery</option>
            <option>Offline</option>
            <option>Not Available</option>
          </select>
        </div>

        {/* Orders Today */}
        <div className="mb-5">
          <label className="text-sm text-slate-600 font-medium">
            Orders Today
          </label>
          <input
            type="number"
            className={fieldClass}
            value={form.ordersToday}
            min={0}
            onChange={(e) =>
              setForm({ ...form, ordersToday: Number(e.target.value) })
            }
          />
        </div>

        {/* Submit */}
        <button
          className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 transition"
          onClick={handleSubmit}
        >
          {initialData ? "Save Changes" : "Register Rider"}
        </button>
      </motion.div>
    </div>
  );
}
