import { useState } from "react";
import { motion } from "framer-motion";
import { XCircle, AlertTriangle } from "lucide-react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;     // you can replace "any" with your Order type
  onSubmit: (reason: string) => void;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  order,
  onSubmit,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !order) return null;

  const submit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-stretch">
      {/* Overlay */}
      <div
        className="flex-1 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 
        to-slate-950 border-l border-red-500/40 text-slate-50 
        shadow-[0_25px_80px_rgba(239,68,68,0.9)] p-6 overflow-y-auto relative"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-400" />
                </span>
                Cancel Order
              </h2>
              <p className="text-xs text-slate-400 mt-1">ORD - {order.id}</p>
            </div>

            <button
              className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-4 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            Please provide a cancellation note:
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full h-28 rounded-lg bg-slate-900/50 border border-slate-700/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-700/70 rounded-lg text-sm hover:bg-slate-600/70"
            >
              Close
            </button>

            <button
              onClick={submit}
              className="px-4 py-2 bg-red-600 font-semibold rounded-lg hover:bg-red-700"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
