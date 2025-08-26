import { Info } from "lucide-react";
import { Badge } from "flowbite-react";

export default function ProductLegendLayout() {
    return (
        <div className="flex justify-center w-full">
            <div className="p-6 bg-gray-100 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-4xl">
                <div className="flex items-center gap-2 justify-center">
                    <Info className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-600">Freshness Legend</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-800">
                    <Badge
                        color="success"
                        className="rounded-xl bg-emerald-500 px-4 py-2 shadow-md hover:shadow-lg transition duration-300"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-600 rounded-full inline-block" />
                            <span className="font-semibold text-white">Fresh</span>
                            <span className="hidden sm:inline text-xs text-white">(More than 30 days)</span>
                        </span>
                    </Badge>

                    <Badge
                        color="warning"
                        className="rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition duration-300 bg-yellow-400 text-yellow-900"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block" />
                            <span className="font-semibold">Moderate</span>
                            <span className="hidden sm:inline text-xs">(7–30 days)</span>
                        </span>
                    </Badge>

                    <Badge
                        color="failure"
                        className="rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition duration-300 bg-orange-400 text-orange-900"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-orange-500 rounded-full inline-block" />
                            <span className="font-semibold">Near Expiry</span>
                            <span className="hidden sm:inline text-xs">(3–6 days)</span>
                        </span>
                    </Badge>

                    <Badge
                        color="failure"
                        className="rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition duration-300 bg-red-500 text-white"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-600 rounded-full inline-block" />
                            <span className="font-semibold">Expiring / Expired</span>
                            <span className="hidden sm:inline text-xs text-white">(0–2 days)</span>
                        </span>
                    </Badge>
                </div>
            </div>
        </div>
    );
}
