import { motion } from "framer-motion";
import { Route, MapPin, User, Clock } from "lucide-react";
import type { Order } from "../../hooks/Order";

interface Props {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function RouteModal({ isOpen, order, onClose }: Props) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-slate-900 rounded-2xl p-6 border border-emerald-500/40 relative"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-50">
              <Route className="w-5 h-5 text-emerald-400" />
              Route Tracker
            </h2>
            <button onClick={onClose} className="text-slate-400 text-sm">
              ✕
            </button>
          </div>

          {/* Map Placeholder */}
          <div className="h-64 bg-slate-800/70 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-300 text-xs">
            (Map preview here — integrate later)
          </div>

          <div className="mt-4 text-sm text-slate-300">
            <p>
              <MapPin className="inline w-3 h-3 text-emerald-400 mr-1" />
              {order.address}
            </p>

            {order.distanceKm && (
              <p className="mt-1">
                <Route className="inline w-3 h-3 text-sky-300 mr-1" />
                Estimated distance: {order.distanceKm.toFixed(1)} km
              </p>
            )}

            <p className="mt-1">
              <User className="inline w-3 h-3 text-emerald-300 mr-1" />
              Rider: {order.rider ?? "Unassigned"}
            </p>

            {order.scheduledTime && (
              <p className="mt-1">
                <Clock className="inline w-3 h-3 text-slate-300 mr-1" />
                Delivery ETA: {order.scheduledTime}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
