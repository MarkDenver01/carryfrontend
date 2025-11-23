import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface OrderContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null; // kung gusto mo strict type, papalitan ko
}

export default function OrderContactModal({
  isOpen,
  onClose,
  order,
}: OrderContactModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-stretch">
      <div
        className="flex-1 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-l border-emerald-500/40 text-slate-50 p-6 overflow-y-auto relative"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Lucide.Phone className="w-4 h-4 text-emerald-400" />
                </span>
                Contact Customer
              </h2>

              <p className="text-xs text-slate-400 mt-1">ORD - {order.id}</p>
            </div>

            <button
              className="text-slate-400 hover:text-slate-100 px-2 py-1 rounded-full"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Customer */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400">Customer Name</p>
              <p className="flex items-center gap-2 mt-1 font-semibold">
                <Lucide.User className="w-4 h-4 text-emerald-400" />
                {order.name}
              </p>
            </div>

            {/* Address */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400">Address</p>
              <p className="flex items-center gap-2 mt-1">
                <Lucide.MapPin className="w-4 h-4 text-emerald-400" />
                {order.address}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400">Phone Number</p>
              <p className="text-lg font-bold mt-1">09XX XXX XXXX</p>

              <div className="flex gap-3 mt-4">
                <a
                  href={`tel:09XXXXXXXX`}
                  className="flex-1 bg-emerald-600 py-2 rounded-lg text-center font-semibold"
                >
                  <Lucide.Phone className="inline-block mr-1 w-4 h-4" />
                  Call
                </a>

                <a
                  href={`sms:09XXXXXXXX`}
                  className="flex-1 bg-sky-600 py-2 rounded-lg text-center font-semibold"
                >
                  <Lucide.MessageSquare className="inline-block mr-1 w-4 h-4" />
                  SMS
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
