import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import type { Order } from "../../hooks/Order";

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function RouteMapModal({
  isOpen,
  onClose,
  order,
}: RouteMapModalProps) {
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
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900
        to-slate-950 border-l border-emerald-500/40 text-slate-50 p-6 relative"
      >
        {/* Safe icon rendering — no errors, even if icon doesn't exist */}
        {Lucide.Navigation && (
          <Lucide.Navigation className="w-5 h-5 text-emerald-400" />
        )}
      </motion.div>
    </div>
  );
}
