import { useState } from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import type { Order } from "../../hooks/Order";

interface Props {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}

export default function CancelOrderModal({
  isOpen,
  order,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 p-6 rounded-2xl border border-red-500/40"
      >
        <div className="flex justify-between items-start">
          <h2 className="text-red-300 font-bold text-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-300" />
            Cancel Order
          </h2>
          <button onClick={onClose} className="text-slate-400 text-sm">✕</button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation..."
          className="mt-4 w-full h-28 rounded-xl p-3 bg-slate-800 text-slate-100 border border-slate-600"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-slate-700 rounded-xl">
            Close
          </button>
          <button
            onClick={() => onConfirm(order.id, reason)}
            className="px-4 py-2 bg-red-500 rounded-xl text-white"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
