import notificationsJson from "../data/notifications.json";
import { PackageCheck, MessageCircle, ShieldCheck } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
    PackageCheck,
    MessageCircle,
    ShieldCheck,
};

export const useNotifications = () => {
    return notificationsJson.map((n) => ({
        ...n,
        icon: iconMap[n.icon],
    }));
};
