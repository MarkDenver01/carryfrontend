import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Props {
    rotate: boolean;
}

export default function RotateIcon({ rotate }: Props) {
    return (
        <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: rotate ? 180 : 0 }}
            transition={{ duration: 0.3 }}
        >
            <ChevronDown size={16} />
        </motion.div>
    );
}
