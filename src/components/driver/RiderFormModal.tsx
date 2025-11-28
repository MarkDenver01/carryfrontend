// src/components/driver/RiderFormModal.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Rider, RiderStatus } from "../../context/DriverContext";

type RiderFormValues = {
  name: string;
  contact: string;
  homeBase: string;
  status: RiderStatus;
  ordersToday: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RiderFormValues) => void;
  initialData: Rider | null; // always editing
};

const statusOptions: RiderStatus[] = [
  "Available",
  "On Delivery",
  "Offline",
  "Not Available",
];

export default function RiderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState<RiderFormValues>({
    name: "",
    contact: "",
    homeBase: "",
    status: "Available",
    ordersToday: 0,
  });

  // Load data into form when modal opens
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        contact: initialData.contact,
        homeBase: initialData.homeBase,
        status: initialData.status,
        ordersToday: initialData.ordersToday ?? 0,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
        >
          {/* ❌ Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <h1 className="text-xl font-bold text-slate-900 mb-5">
            Edit Rider Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Contact Number
              </label>
              <input
                className={inputClass}
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </div>

            {/* Home Base */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Home Base
              </label>
              <input
                className={inputClass}
                value={form.homeBase}
                onChange={(e) => setForm({ ...form, homeBase: e.target.value })}
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as RiderStatus })
                }
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Orders Today */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Orders Today
              </label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.ordersToday}
                onChange={(e) =>
                  setForm({ ...form, ordersToday: Number(e.target.value) })
                }
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold shadow"
            >
              Save Changes
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
